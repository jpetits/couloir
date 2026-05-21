"use client";

import { createContext, useContext } from "react";

import { useQuery } from "@tanstack/react-query";

import { useApi } from "@/app/hooks/useApi";
import { ROUTES } from "@/routing/constants";

interface UserMe {
  stravaConnected: boolean;
  stravaAthleteId: string | null;
  username: string | null;
  isPublic: boolean;
}

interface UserContextValue {
  user: UserMe | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const apiFetch = useApi();

  const { data, isLoading } = useQuery<UserMe>({
    queryKey: ["userMe"],
    queryFn: () => apiFetch<UserMe>(ROUTES.api.userMe),
  });

  return (
    <UserContext.Provider value={{ user: data ?? null, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserMe() {
  return useContext(UserContext);
}
