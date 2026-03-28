"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routing/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="container mx-auto px-4 py-6">{children}</main>;
}
