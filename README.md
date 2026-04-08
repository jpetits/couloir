# Couloir

**Live:** [couloir.work](https://www.couloir.work)

A personal activity tracker for outdoor sports — skiing, surfing, trekking, and more. Upload GPS files from any device or sync directly from Strava, and visualize all your activities on an interactive map with elevation and speed charts.

## Features

- Upload `.fit` files from GPS devices
- Sync activities from Strava (OAuth + background sync with real-time WebSocket progress)
- Interactive map with multi-activity overlay and hover to explore each track
- Elevation and speed charts synced with the map cursor
- Activity list with filtering, sorting, and infinite scroll
- Bulk selection and delete
- Stats page with distance per month chart and personal records
- Dark/light mode

## Tech Stack

**Frontend**
- [Next.js 15](https://nextjs.org/) — App Router, server components, Suspense streaming
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query) — infinite scroll, optimistic updates
- [TanStack Table](https://tanstack.com/table) — sortable, filterable activity list
- [Zustand](https://zustand-demo.pmnd.rs/) — bulk selection state with persistence
- [Recharts](https://recharts.org/) — elevation and speed charts
- [React Leaflet](https://react-leaflet.js.org/) — GPS track map
- [Clerk](https://clerk.com/) — authentication
- [Zod](https://zod.dev/) — schema validation

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Drizzle ORM](https://orm.drizzle.team/) — type-safe queries
- [PostgreSQL](https://www.postgresql.org/) via [NeonDB](https://neon.tech/)
- [ws](https://github.com/websockets/ws) — WebSocket server for real-time sync progress
- [Clerk](https://clerk.com/) — JWT verification

**Infrastructure**
- [Vercel](https://vercel.com/) — frontend
- [Railway](https://railway.app/) — backend
- [NeonDB](https://neon.tech/) — serverless Postgres
- [Playwright](https://playwright.dev/) — end-to-end tests

## Architecture

Monorepo with two separate deployments:

```
couloir/
├── client/   # Next.js app → Vercel
└── server/   # Express API + WebSocket server → Railway
```

Authentication is handled by Clerk. The client sends requests to the Express API with a JWT, verified server-side via `@clerk/express`. WebSocket connections authenticate the same way using a token passed as a query parameter.

GPS streams are simplified using the [Ramer-Douglas-Peucker algorithm](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm) via `@turf/turf` before storage to reduce point count while preserving track shape.

## Local Development

**Prerequisites:** Node.js 20+, pnpm, a PostgreSQL database (or NeonDB)

```bash
# Clone
git clone https://github.com/jpetits/couloir.git
cd couloir

# Server
cd server
cp .env.example .env   # fill in DATABASE_URL, CLERK_SECRET_KEY, STRAVA_*
pnpm install
pnpm db:migrate
pnpm dev

# Client (separate terminal)
cd client
cp .env.example .env   # fill in NEXT_PUBLIC_API_URL, CLERK keys
pnpm install
pnpm dev
```
