"use client";
import { useState } from "react";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { UserProvider } from "./context/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <ClerkProvider>
          <UserProvider>
            <div className="flex min-h-screen flex-col">{children}</div>
          </UserProvider>
        </ClerkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
