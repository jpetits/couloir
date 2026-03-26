import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | undefined) {
  if (!date) return "TBA";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "TBA";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}
