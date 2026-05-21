"use client";

import { useEffect, useRef, useState } from "react";

import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import CouloirLogo from "@/components/CouloirLogo";
import { ROUTES } from "@/routing/constants";

export default function Home() {
  const [visible, setVisible] = useState([false, false, false]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const i = cardRefs.current.indexOf(e.target as HTMLDivElement);
          if (e.isIntersecting && i !== -1)
            setVisible((v) => v.map((val, idx) => (idx === i ? true : val)));
        }),
      { threshold: 0.1 },
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background font-condensed">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 border-b border-ui-line overflow-hidden">
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transformOrigin: "center center",
            maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to left, black 0%, transparent 100%)",
          }}
        >
          <Image
            src="/hero.webp"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="relative max-w-5xl mx-auto w-full">
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
            <span className="font-mono text-sm tracking-widest text-ui-muted uppercase">
              GPS · STRAVA · FIT · KML
            </span>
          </div>

          <div className="flex gap-3">
            <Show when="signed-out">
              <SignInButton>
                <button className="px-6 py-2.5 border border-ui-line text-ui-base font-mono text-sm tracking-widest uppercase hover:border-ui-muted hover:text-ui-hi transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-6 py-2.5 bg-ui-hi text-background font-mono text-sm tracking-widest uppercase hover:bg-ui-base transition-colors cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href={ROUTES.activities}
                className="px-6 py-2.5 bg-ui-hi text-background font-mono text-sm tracking-widest uppercase hover:bg-ui-base transition-colors cursor-pointer"
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
            <div className="font-mono text-sm tracking-widest text-ui-dim mb-4">
              {index}
            </div>
            <h3 className="text-4xl font-bold uppercase tracking-wide text-ui-hi mb-2">
              {title}
            </h3>
            <p className="font-mono text-sm text-ui-muted leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </section>

      {/* Screenshots */}
      <section className="py-24 flex flex-col gap-16">
        {[
          {
            src: "/map.webp",
            alt: "3D terrain map view",
            caption: "3D terrain map",
            right: false,
            priority: true,
          },
          {
            src: "/map3.webp",
            alt: "400+ activities overview",
            caption: "400+ activities",
            right: true,
            priority: false,
          },
          {
            src: "/map4.webp",
            alt: "Activity list",
            caption: "Activity list",
            right: false,
            priority: false,
          },
        ].map(({ src, alt, caption, right, priority }, i) => (
          <div
            key={src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={`flex flex-col w-full md:w-3/4 ${right ? "self-end" : "self-start"} ${visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"}`}
            style={{
              transition:
                "transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.9s ease",
            }}
          >
            <div className="relative w-full h-96 overflow-hidden rounded-sm">
              <div
                className="absolute inset-0"
                style={{
                  transform: visible[i] ? "translateY(0)" : "translateY(80px)",
                  transition: "transform 1.4s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover object-top"
                  priority={priority}
                />
              </div>
            </div>
            <p className="font-mono text-sm tracking-widest text-ui-muted uppercase mt-3 px-1">
              {caption}
            </p>
          </div>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="border-t border-ui-line px-6 md:px-16 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 max-w-7xl mx-auto">
        <div>
          <p className="text-5xl font-bold uppercase tracking-wide text-ui-hi">
            Start logging.
          </p>
          <p className="font-mono text-sm text-ui-muted mt-1 tracking-widest">
            Free to use. No subscription.
          </p>
        </div>
        <Show when="signed-out">
          <SignUpButton>
            <button className="px-8 py-3 bg-ui-hi text-background font-mono text-sm tracking-widest uppercase hover:bg-ui-base transition-colors cursor-pointer">
              Create account →
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            href={ROUTES.activities}
            className="px-8 py-3 bg-ui-hi text-background font-mono text-sm tracking-widest uppercase hover:bg-ui-base transition-colors cursor-pointer"
          >
            My Activities →
          </Link>
        </Show>
      </section>
    </main>
  );
}
