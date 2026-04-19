import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import { Toaster } from "sonner";

import { DeviceProvider, DeviceType } from "@/context/DeviceContext";
import { cn } from "@/lib/utils";

import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Couloir",
  description: "Explore your ski activities",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { device } = userAgent({ headers: await headers() });
  const deviceType = device.type;

  return (
    <html
      lang="fr"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body>
        <DeviceProvider deviceType={deviceType as DeviceType}>
          <Providers>{children}</Providers>
        </DeviceProvider>
        <Toaster />
      </body>
    </html>
  );
}
