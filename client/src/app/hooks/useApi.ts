import { useAuth } from "@clerk/nextjs";

export function useApi() {
  const { getToken } = useAuth();

  return async function apiFetch<T>(
    path: string,
    options?: RequestInit,
  ): Promise<T> {
    const token = await getToken();

    const isFormData = options?.body instanceof FormData;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
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
