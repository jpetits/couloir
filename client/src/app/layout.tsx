import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { userAgent } from "next/server";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { DeviceProvider } from "@/context/DeviceContext";

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
  const isMobile = device.type === "mobile" || device.type === "tablet";

  return (
    <html
      lang="fr"
      className={cn("font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body>
        <DeviceProvider isMobile={isMobile}>
          <Providers>{children}</Providers>
        </DeviceProvider>
        <Toaster />
      </body>
    </html>
  );
}
