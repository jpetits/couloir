"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/app/hooks/useApi";
import { ActivitySchema } from "@/lib/schema";
import { useUpload } from "@/app/hooks/useUpload";

export default function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, error, loading } = useUpload();

  async function handleFile(file: File) {
    await uploadFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Poster une activité"}
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
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
