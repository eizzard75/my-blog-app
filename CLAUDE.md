# BlogAI - AI Blog Generator SaaS Boilerplate

## Project Overview
SaaS boilerplate for an AI-powered blog generator. Built as a teaching tool
for a Claude Code course. Students clone this template and build out the
AI blog generation feature during the course.

## Tech Stack
- **Framework:** Next.js 15 (App Router) with TypeScript
- **Auth:** Firebase Authentication (Google + email/password)
- **Database:** Cloud Firestore
- **AI:** OpenRouter (Anthropic Claude Sonnet via OpenRouter API)
- **Payments:** Stripe Checkout + Subscriptions + Webhooks
- **Email:** Firebase "Trigger Email from Firestore" extension (via SendGrid)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Deployment:** Vercel
- **Theme:** Dark/light/system mode via next-themes

## Project Structure
```
src/
  app/              Next.js App Router pages and API routes
    (auth)/         Login and signup pages
    (dashboard)/    Protected dashboard pages
    (legal)/        Terms of Service and Privacy Policy
    api/            API routes (Stripe webhooks)
  components/
    ui/             shadcn/ui components (auto-generated)
    auth/           Authentication form components
    landing/        Landing page sections (navbar, hero, pricing, footer)
    dashboard/      Dashboard components (sidebar, header, blog-generator)
    providers.tsx   App-wide providers (Theme + Auth)
    theme-toggle.tsx  Dark/light mode toggle
  lib/
    firebase/       Firebase client + admin SDK setup
    stripe/         Stripe client + server + checkout + webhooks
    firestore/      Firestore CRUD helpers (users, posts, mail)
    utils.ts        Shared utilities (cn function)
  hooks/            Custom React hooks (useAuth)
  context/          React context providers (AuthContext)
  types/            TypeScript type definitions
  middleware.ts     Auth middleware (next-firebase-auth-edge)
```

## Key Architecture
- Firebase Client SDK (`lib/firebase/client.ts`) = browser only
- Firebase Admin SDK (`lib/firebase/admin.ts`) = server only (uses `server-only` guard)
- Blog generation API at `app/api/generate/route.ts` (streams from OpenRouter/Claude)
- Stripe webhooks at `app/api/webhooks/stripe/route.ts` (raw body for signature verification)
- Stripe checkout via server action in `lib/stripe/checkout.ts`
- Auth middleware protects `/dashboard/*` routes, redirects to `/login`
- Welcome emails via Firestore `mail` collection (Firebase extension handles sending)

## Commands
- `pnpm dev` -- Start dev server (Turbopack)
- `pnpm build` -- Production build
- `pnpm start` -- Start production server
- `pnpm lint` -- Run ESLint
- `pnpm format` -- Run Prettier

## Environment Variables
All secrets and configuration live in `.env.local`. This file is git-ignored (via `.env*` in `.gitignore`)
and will never be committed — the template stays clean for other users. `.env.example` is committed as a
reference with empty placeholder keys. See `.env.example` for documentation of each variable.

## Conventions
- Client components use `"use client"` directive
- Server-only modules use `import "server-only"` guard
- shadcn/ui components in `src/components/ui/`
- Feature components grouped by domain (auth/, landing/, dashboard/)
- All imports use `@/` path alias
- Use `cn()` from `lib/utils` for conditional class merging
- Add new shadcn components: `pnpm dlx shadcn@latest add [component-name]`

## Common Tasks
- **Add a page:** Create folder in `src/app/` following App Router conventions
- **Add a Firestore collection:** Add types in `types/firebase.ts`, helpers in `lib/firestore/`
- **Protect a route:** Add path pattern to `middleware.ts`
- **Add a shadcn component:** `pnpm dlx shadcn@latest add [name]`
- **Add a Stripe product:** Create in Stripe Dashboard, update STRIPE_PRO_PRICE_ID env var

## Current Sprint
The AI blog generator is wired up and functional via OpenRouter (Anthropic Claude Sonnet).
Students can extend the app with subscription gating, a posts list page, settings page,
markdown rendering, and export features.

---

## Onboarding Guide (for Claude Code)

When a user asks you to help them set up this project, or if they seem new and haven't
run the app yet, follow the procedure below. This is designed for beginners who may have
never used a terminal before.

### Phase 1: Check Prerequisites

Run these checks automatically and report what's installed vs missing:

1. `git --version` — is Git installed?
2. `node --version` — is Node.js installed? (need v18+)
3. `pnpm --version` — is pnpm installed?
4. `stripe --version` — is Stripe CLI installed?

**For anything missing, tell the user what to install and where to get it:**
- **Git:** Download from https://git-scm.com/download/win — run installer with defaults
- **Node.js:** Download LTS from https://nodejs.org — run installer with defaults
- **pnpm:** You can install this for them: `npm install -g pnpm`
- **Stripe CLI:** You can install this for them: `winget install Stripe.StripeCLI`

After they install Git or Node.js, remind them to close and reopen the VS Code terminal
so the PATH updates. Then re-run the check.

### Phase 2: Install Dependencies

Once prerequisites are confirmed:
1. Run `pnpm install` from the project root
2. Verify `node_modules` was created

### Phase 3: Configure Environment

1. If `.env.local` does not exist, copy `.env.example` to `.env.local`
2. Generate cookie secrets automatically:
   - Run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` twice
   - Write both values into `.env.local` for `COOKIE_SECRET_CURRENT` and `COOKIE_SECRET_PREVIOUS`
3. Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

Then guide the user through each service, one at a time. For each service, explain
what the user needs to do in the browser, and what values to paste back. Write all
values directly into `.env.local` as the user provides them.

#### Firebase Client SDK
Tell the user:
> Go to https://console.firebase.google.com and create a project (or use an existing one).
> Then go to Project Settings > Your apps > click the web icon (</>) to register a web app.
> You'll see a firebaseConfig object. Paste the whole object here and I'll extract the values.

When they paste the config, parse it and write these into `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Firebase Admin SDK
Tell the user:
> In Firebase Console, go to Project Settings > Service accounts tab.
> Click "Generate new private key" — this downloads a JSON file.
> Open that JSON file and paste the contents here. I'll extract what I need.
> (Don't worry — I won't store the file, I'll just read the values I need for .env.local)

When they paste the JSON, extract and write into `.env.local`:
- `FIREBASE_ADMIN_PROJECT_ID` (from `project_id`)
- `FIREBASE_ADMIN_CLIENT_EMAIL` (from `client_email`)
- `FIREBASE_ADMIN_PRIVATE_KEY` (from `private_key` — wrap in double quotes in the env file)

Also remind them:
> Make sure you've enabled Authentication in Firebase Console:
> Go to Authentication > Sign-in method > enable "Email/Password".
> Also create a Firestore Database: go to Firestore Database > Create database > Start in test mode.

#### OpenRouter (AI blog generation)
Tell the user:
> Go to https://openrouter.ai, create an account, then go to https://openrouter.ai/keys
> and create an API key. Paste the key here.

Write into `.env.local`:
- `OPENROUTER_API_KEY`

Note: The blog generator uses OpenRouter to call `anthropic/claude-sonnet-4-20250514`.
The API route is at `src/app/api/generate/route.ts`. No other AI config is needed.

#### Stripe
Tell the user:
> Go to https://dashboard.stripe.com — make sure "Test mode" is ON (toggle in the top right).
> Then go to Developers > API keys. Paste your Publishable key and Secret key here.

Write into `.env.local`:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`

Then tell them:
> Now create a product: go to Product catalog > + Add product.
> Name it "Pro Plan", set pricing to Recurring at $19/month (to match the landing page), and save.
> On the product page, copy the Price ID (starts with price_...) and paste it here.

Write into `.env.local`:
- `STRIPE_PRO_PRICE_ID`

For the webhook secret:
> Open a NEW terminal (keep the current one available) and run: stripe login
> After logging in, run: stripe listen --forward-to localhost:3000/api/webhooks/stripe
> It will show a webhook signing secret (starts with whsec_...). Paste it here.

Write into `.env.local`:
- `STRIPE_WEBHOOK_SECRET`

### Phase 4: Start the App

1. Run `pnpm dev`
2. Tell the user to open http://localhost:3000 in their browser
3. Walk them through verification:
   - Landing page should load with hero, pricing, and footer
   - Theme toggle (sun/moon icon) should switch light/dark
   - Sign up at /signup, then log in at /login
   - Dashboard should show after login
   - Stripe checkout should work with test card 4242 4242 4242 4242

### Troubleshooting Tips

If the user hits problems, check these common issues:
- **pnpm not found:** `npm install -g pnpm`, then restart terminal
- **Wrong directory:** Make sure they're in the folder with `package.json`
- **Blank page / errors:** Check `.env.local` — read it and look for empty values
- **Auth not working:** Remind them to enable providers in Firebase Console
- **Stripe not redirecting:** Check all 4 Stripe env vars are filled in
- **Port 3000 in use:** Run `pnpm dev -- -p 3001`
- **Private key issues:** Make sure `FIREBASE_ADMIN_PRIVATE_KEY` is in double quotes with `\n` newlines
- **Blog generation fails:** Check `OPENROUTER_API_KEY` is set in `.env.local` and the account has credits
- **"Unauthorized" on generate:** The user must be logged in — the API route checks for `x-user-uid` from middleware
