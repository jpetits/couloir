"use client";
import { useState } from "react";

import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import ThemeButton from "./ui/dashboard/ThemeButton";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ClerkProvider>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <ThemeButton />
            <Show when="signed-out">
              <SignInButton>
                <button>Sign In</button>
              </SignInButton>
              <SignUpButton>
                <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
