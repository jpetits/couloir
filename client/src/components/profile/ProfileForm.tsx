"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { useApi } from "@/app/hooks/useApi";
import { patchUser } from "@/lib/dataClient";
import { User } from "@/lib/schema";

const schema = z.object({
  username: z.string().min(3).max(20),
  isPublic: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function ProfileForm({ user }: { user: User }) {
  const apiFetch = useApi();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      username: user.username ?? "",
      isPublic: user.isPublic ?? false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await patchUser(apiFetch, { ...user, ...data });
      if (user.username !== data.username) {
        router.push(`/u/${data.username}/edit`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setError("username", {
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          {...register("username")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Public Profile
        </label>
        <input
          type="checkbox"
          {...register("isPublic")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer"
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
