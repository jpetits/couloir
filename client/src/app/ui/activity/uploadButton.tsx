"use client";

import { useRef } from "react";
import { useUploadActivity } from "@/app/hooks/useUploadActivity";

export default function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isPending, error, uploadActivity } = useUploadActivity();

  async function handleFile(file: File) {
    await uploadActivity(file);
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {isPending ? "Uploading..." : "Poster une activité"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".fit"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
