"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import CouloirLogo from "@/components/CouloirLogo";
import { ROUTES } from "@/routing/constants";

export default function Home() {
  return (
    <main className="min-h-screen bg-background font-condensed">
      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-16 border-b border-ui-line">
        <div className="max-w-5xl mx-auto w-full">
          <CouloirLogo className="mb-12 opacity-90" />

          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tight text-ui-hi leading-none mb-6">
            All your
            <br />
            <span className="text-ui-dim">adventures,</span>
            <br />
            in one place.
          </h1>

          <div className="flex items-center gap-3 mb-12">
            <span className="font-mono text-3xs tracking-widest text-ui-dim">
              /
            </span>
            <span className="font-mono text-3xs tracking-widest text-ui-muted uppercase">
              GPS · STRAVA · FIT · KML
            </span>
          </div>

          <div className="flex gap-3">
            <Show when="signed-out">
              <SignInButton>
                <button className="px-6 py-2.5 border border-ui-line text-ui-base font-mono text-3xs tracking-widest uppercase hover:border-ui-muted hover:text-ui-hi transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-6 py-2.5 bg-ui-hi text-background font-mono text-3xs tracking-widest uppercase hover:bg-ui-base transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href={ROUTES.activities}
                className="px-6 py-2.5 bg-ui-hi text-background font-mono text-3xs tracking-widest uppercase hover:bg-ui-base transition-colors"
              >
                My Activities →
              </Link>
            </Show>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-ui-line">
        {[
          {
            index: "01",
            title: "Upload FIT files",
            body: "Import directly from your GPS device or sports watch.",
          },
          {
            index: "02",
            title: "Sync with Strava",
            body: "Connect once and your activities sync automatically.",
          },
          {
            index: "03",
            title: "Explore your tracks",
            body: "Interactive map with elevation and speed charts for every activity.",
          },
        ].map(({ index, title, body }) => (
          <div
            key={index}
            className="px-6 md:px-10 py-10 border-r border-ui-line last:border-r-0 border-b md:border-b-0"
          >
            <div className="font-mono text-3xs tracking-widest text-ui-dim mb-4">
              {index}
            </div>
            <h3 className="text-2xl font-bold uppercase tracking-wide text-ui-hi mb-2">
              {title}
            </h3>
            <p className="font-mono text-2xs text-ui-muted leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </section>

      {/* Screenshots */}
      <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto">
        <div className="font-mono text-3xs tracking-widest text-ui-dim mb-6 uppercase">
          / Screenshots
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ui-line border border-ui-line">
          {[
            { src: "/map.webp", alt: "3D terrain map view", caption: "3D terrain map", priority: true },
            { src: "/map3.webp", alt: "400+ activities overview", caption: "400+ activities", priority: false },
            { src: "/map4.webp", alt: "Activity list", caption: "Activity list", priority: false },
          ].map(({ src, alt, caption, priority }) => (
            <div key={src} className="flex flex-col bg-background">
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  priority={priority}
                />
              </div>
              <div className="px-3 py-2 border-t border-ui-line">
                <span className="font-mono text-3xs tracking-widest text-ui-muted uppercase">
                  {caption}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-ui-line px-6 md:px-16 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-7xl mx-auto">
        <div>
          <p className="text-3xl font-bold uppercase tracking-wide text-ui-hi">
            Start logging.
          </p>
          <p className="font-mono text-2xs text-ui-muted mt-1 tracking-widest">
            Free to use. No subscription.
          </p>
        </div>
        <Show when="signed-out">
          <SignUpButton>
            <button className="px-8 py-3 bg-ui-hi text-background font-mono text-3xs tracking-widest uppercase hover:bg-ui-base transition-colors">
              Create account →
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            href={ROUTES.activities}
            className="px-8 py-3 bg-ui-hi text-background font-mono text-3xs tracking-widest uppercase hover:bg-ui-base transition-colors"
          >
            My Activities →
          </Link>
        </Show>
      </section>
    </main>
  );
}
