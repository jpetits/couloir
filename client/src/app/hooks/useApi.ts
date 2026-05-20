import { useAuth } from "@clerk/nextjs";

import { API_BASE_URL } from "@/lib/constants";

export function useApi() {
  const { getToken } = useAuth();

  return async function apiFetch<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const token = await getToken();

    const isFormData = options?.body instanceof FormData;

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };
}
