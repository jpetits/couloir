"use client";

import { useRef } from "react";

import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteActivity } from "@/lib/dataClient";
import type { Activity } from "@/lib/schema";

import { useApi } from "./useApi";

export function useDeleteActivity() {
  const apiFetch = useApi();
  const deleteTimeout = 5000;
  const queryClient = useQueryClient();
  const queryKey = ["activities"];
  const pendingDeletes = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  let previousSnapshots = useRef<Map<string, unknown>>(new Map());

  const cancel = (ids: string[]) => {
    const key = ids.join(",");
    const timer = pendingDeletes.current.get(key);
    if (timer) {
      clearTimeout(timer);
      pendingDeletes.current.delete(key);
      const snapshot = previousSnapshots.current.get(key) as
        | [unknown[], InfiniteData<Activity[]> | undefined][]
        | undefined;
      snapshot?.forEach(([qKey, data]) => queryClient.setQueryData(qKey, data));
      previousSnapshots.current.delete(key);
      queryClient.invalidateQueries({ queryKey });
    }
  };

  return useMutation({
    mutationFn: (ids: string[]) =>
      new Promise((resolve, reject) => {
        const key = ids.join(",");
        const timer = setTimeout(() => {
          pendingDeletes.current.delete(key);
          deleteActivity(apiFetch, ids).then(resolve).catch(reject);
        }, deleteTimeout);
        pendingDeletes.current.set(key, timer);
      }),

    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousData = queryClient.getQueriesData<InfiniteData<Activity[]>>(
        {
          queryKey,
        },
      );

      queryClient.setQueriesData<InfiniteData<Activity[]>>(
        { queryKey },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.filter((activity) => !ids.includes(activity.id)),
            ),
          };
        },
      );

      toast(
        ids.length > 1
          ? `${ids.length} activities deleted`
          : "Activity deleted",
        {
          action: { label: "Undo", onClick: () => cancel(ids) },
          duration: deleteTimeout,
        },
      );

      previousSnapshots.current.set(ids.join(","), previousData);

      return { previousData };
    },

    onError: (_err, _ids, onMutateResult) => {
      onMutateResult?.previousData.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );

      toast("Failed to delete activity", {
        duration: deleteTimeout,
      });
    },

    onSettled: (_data, _err, ids) => {
      previousSnapshots.current.delete(ids.join(","));
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}
