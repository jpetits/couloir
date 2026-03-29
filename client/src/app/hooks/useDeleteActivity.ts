"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData, QueryKey } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { deleteActivity } from "@/lib/data.client";
import type { Activity } from "@/lib/schema";
import { useRef } from "react";
import { toast } from "sonner";

export function useDeleteActivity() {
  const deleteTimeout = 5000;
  const queryClient = useQueryClient();
  const apiFetch = useApi();
  const queryKey = ["activities"];
  const pendingDeletes = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  let previousSnapshots = useRef<Map<string, unknown>>(new Map());

  const cancel = (id: string) => {
    const timer = pendingDeletes.current.get(id);
    if (timer) {
      clearTimeout(timer);
      pendingDeletes.current.delete(id);
      const snapshot = previousSnapshots.current.get(id) as
        | [QueryKey, unknown][]
        | undefined;
      previousSnapshots.current.delete(id);
      snapshot?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      queryClient.invalidateQueries({
        queryKey,
      });
    }
  };

  return useMutation({
    mutationFn: (id: string) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pendingDeletes.current.delete(id);
          deleteActivity(apiFetch, id).then(resolve).catch(reject);
        }, deleteTimeout);
        pendingDeletes.current.set(id, timer);
      }),

    onMutate: async (id) => {
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
              page.filter((activity) => activity.id !== id),
            ),
          };
        },
      );

      toast("Activity deleted", {
        action: { label: "Undo", onClick: () => cancel(id) },
        duration: deleteTimeout,
      });

      previousSnapshots.current.set(id, previousData);

      return { previousData };
    },

    onError: (_err, _id, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData);
    },

    onSettled: (_data, _err, id) => {
      previousSnapshots.current.delete(id);
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}
