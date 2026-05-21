"use client";

import { useState } from "react";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import CouloirLogo from "@/components/CouloirLogo";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routing/constants";

import { useUserMe } from "./context/UserContext";
import ThemeButton from "./ui/dashboard/ThemeButton";

const NAV_LINKS = [
  { label: "Activities", href: ROUTES.activities },
  { label: "Stats", href: ROUTES.stats },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "font-mono text-sm tracking-widest uppercase transition-colors",
        active ? "text-ui-hi" : "text-ui-muted hover:text-ui-base",
      )}
    >
      {label}
    </Link>
  );
}
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUserMe();

  return (
    <header className="relative border-b border-ui-line bg-background">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-8">
          <Link href={ROUTES.home}>
            <CouloirLogo width={130} height={33} />
          </Link>
          <Show when="signed-in">
            <nav className="flex items-center gap-6">
              {NAV_LINKS.map((l) => (
                <NavLink key={l.href} {...l} />
              ))}
              <NavLink
                key="map"
                label="Map"
                href={ROUTES.profile(user?.username!)}
              />
              <NavLink
                key="profile"
                label="Profile"
                href={ROUTES.editProfile(user?.username!)}
              />
            </nav>
          </Show>
        </div>
        <div className="flex items-center gap-4">
          <ThemeButton />
          <Show when="signed-out">
            <SignInButton>
              <button className="font-mono text-3xs tracking-widest uppercase text-ui-muted hover:text-ui-hi transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="font-mono text-3xs tracking-widest uppercase border border-ui-line px-4 py-2 text-ui-base hover:text-ui-hi hover:border-ui-base transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between px-4 h-16">
        <Link href={ROUTES.home}>
          <CouloirLogo width={100} height={25} />
        </Link>
        <button
          className="p-2 text-ui-muted hover:text-ui-hi transition-colors"
          onClick={() => setMobileMenuOpen((v) => !v)}
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-ui-line px-4 py-4 flex flex-col gap-4 bg-background">
          <Show when="signed-in">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.href} {...l} />
            ))}
          </Show>
          <div className="flex items-center gap-4 pt-2 border-t border-ui-line">
            <ThemeButton />
            <Show when="signed-out">
              <SignInButton>
                <button className="font-mono text-3xs tracking-widest uppercase text-ui-muted cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="font-mono text-3xs tracking-widest uppercase border border-ui-line px-4 py-2 text-ui-base cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      )}
    </header>
  );
}
