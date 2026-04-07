"use client";
import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-6 cursor-pointer"
      aria-label="Go back"
      onClick={() => router.back()}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Back
    </button>
  );
}
