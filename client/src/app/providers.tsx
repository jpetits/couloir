"use client";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import ThemeButton from "./ui/dashboard/ThemeButton";
import Link from "next/dist/client/link";
import { ROUTES } from "@/routing/constants";

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
                <Link href={ROUTES.signIn}>Sign In</Link>
              </SignInButton>
              <SignUpButton>
                <Link
                  href={ROUTES.signUp}
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Sign Up
                </Link>
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
