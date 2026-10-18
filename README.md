# Tagify

Marketing site and customer dashboard for **Tagify**, a server-side tracking platform
(Tagify Gateway + hosted sGTM containers).

Every new account gets a demo workspace: a Gateway with destinations and 30 days of analytics,
a running sGTM container and a live event stream. Container provisioning, DNS checks, OAuth
connections and ad-platform delivery are simulated.

## Stack

- **Next.js 16** (App Router, Route Handlers, Cache Components) + **React 19**
- **Better Auth** with **MongoDB**: email/password, Google, GitHub, password reset
- **MongoDB** aggregations for analytics, **Zod** for request validation
- **TanStack Query**, **Tailwind CSS v4**, Radix UI, Recharts

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable                                    | Purpose                                         |
| ------------------------------------------- | ----------------------------------------------- |
| `BETTER_AUTH_SECRET`                        | Signing secret (`openssl rand -base64 32`)      |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL`   | Public URL of this app                          |
| `MONGODB_URI`                               | MongoDB connection string (db name in the path) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app                                |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app                                |

OAuth callback URLs: `<app-url>/api/auth/callback/google` and `<app-url>/api/auth/callback/github`.

## Project structure

```
src/
├── app/
│   ├── (marketing)/   Public pages (landing, pricing, blog, legal)
│   ├── (auth)/        Login, signup, forgot/reset password
│   ├── dashboard/     Gateways, sGTM containers, analytics, live events, settings, admin
│   └── api/           Better Auth + dashboard API route handlers
├── components/        Shared UI (ui/ = Radix-based primitives)
├── lib/               Auth config, MongoDB client, fetch wrapper, plans
├── server/            Data access, analytics pipelines, demo seeding
└── proxy.ts           Redirects signed-out users away from /dashboard
```

## How it works

- Sessions are Better Auth cookies. `proxy.ts` does a fast cookie check, the dashboard layout and
  every API route validate the session on the server.
- A `user.create` database hook seeds the demo workspace for each new account.
- Analytics are computed with MongoDB aggregation pipelines over the `events` collection.
- The live events page is a Server-Sent Events stream that polls for new events, so it works on
  serverless hosts.
- Admin routes require `user.role === "admin"`, set directly in the `user` collection.

## Deploying to Vercel

1. Import the repository in Vercel.
2. Add the environment variables above, with `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` set to
   the Vercel URL.
3. Add the production callback URLs to the Google and GitHub OAuth apps.
4. In MongoDB Atlas, allow network access from Vercel (`0.0.0.0/0`).

## Scripts

| Command             | Description                |
| ------------------- | -------------------------- |
| `npm run dev`       | Start the dev server       |
| `npm run build`     | Production build           |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | TypeScript, no emit        |
| `npm run format`    | Prettier                   |
