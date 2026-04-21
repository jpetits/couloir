"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import CouloirLogo from "@/components/CouloirLogo";
import { ROUTES } from "@/routing/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <CouloirLogo className="mb-6" />
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          All your adventures,
          <br />
          in one place.
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mb-8">
          Upload GPS files or sync from Strava. Visualize every ski run, surf
          session, and trek on an interactive map.
        </p>
        <div className="flex gap-3">
          <Show when="signed-out">
            <SignInButton>
              <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href={ROUTES.activities}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              View my activities
            </Link>
          </Show>
        </div>
      </section>

      {/* Screenshots */}
      <section className="px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl overflow-hidden border shadow-2xl">
            <Image
              src="/map.webp"
              alt="3D terrain map view"
              width={1200}
              height={700}
              className="w-full object-cover"
              priority
            />
          </div>
          <div className="rounded-xl overflow-hidden border shadow-2xl">
            <Image
              src="/map2.webp"
              alt="2D speed heatmap view"
              width={1200}
              height={700}
              className="w-full object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden border shadow-2xl">
            <Image
              src="/map3.webp"
              alt="400+ activities overview"
              width={1200}
              height={700}
              className="w-full object-cover"
            />
          </div>
          <div className="rounded-xl overflow-hidden border shadow-2xl">
            <Image
              src="/map4.webp"
              alt="Activity list with FIT upload and Strava sync"
              width={1200}
              height={700}
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto px-6 py-24">
        <Feature
          title="Upload FIT files"
          description="Import directly from your GPS device or sports watch."
        />
        <Feature
          title="Sync with Strava"
          description="Connect once and your activities sync automatically."
        />
        <Feature
          title="Explore your tracks"
          description="Interactive map with elevation and speed charts for every activity."
        />
      </section>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
