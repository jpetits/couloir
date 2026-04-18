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
import { Menu, X } from "lucide-react";
import { ThemeProvider } from "next-themes";

import ThemeButton from "./ui/dashboard/ThemeButton";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ClerkProvider>
          <header className="relative">
            <div className="hidden md:flex justify-end items-center p-4 gap-4 h-16">
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
            </div>

            <button
              className="md:hidden absolute top-3 right-3 z-[10001] p-2 rounded-md bg-background/80 backdrop-blur-sm border"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {mobileMenuOpen && (
              <div className="md:hidden absolute top-12 right-3 z-[10001] flex items-center gap-3 p-3 rounded-lg bg-background border shadow-lg">
                <ThemeButton />
                <Show when="signed-out">
                  <SignInButton>
                    <button>Sign In</button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                      Sign Up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            )}
          </header>
          {children}
        </ClerkProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
