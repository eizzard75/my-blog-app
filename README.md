# BlogAI - AI Blog Generator SaaS Boilerplate

A full-stack SaaS boilerplate for building an AI-powered blog generator. Built with Next.js 15, Firebase, Stripe, and Tailwind CSS.

## Tech Stack

- **Next.js 15** - App Router, Server Actions, TypeScript
- **Firebase** - Authentication (Google + email/password) + Cloud Firestore
- **Stripe** - Subscription billing with Checkout + Webhooks
- **Tailwind CSS v4** + **shadcn/ui** - Modern, themeable UI
- **Vercel** - One-click deployment

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A Firebase project
- A Stripe account
- (Optional) A Vercel account for deployment

## Getting Started

### 1. Use this Template

Click the green **"Use this template"** button on GitHub, then clone your new repo:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. See sections below for where to find each value.

### 4. Start Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** > Sign-in methods: Email/Password and Google
3. Create a **Cloud Firestore** database (start in test mode for development)
4. Go to Project Settings > General > Your apps > Add web app
   - Copy the config values to your `NEXT_PUBLIC_FIREBASE_*` env vars
5. Go to Project Settings > Service Accounts > Generate new private key
   - Copy `project_id`, `client_email`, and `private_key` to `FIREBASE_ADMIN_*` env vars

### Email Setup (Optional)

To enable welcome emails on signup:

1. Go to Firebase Console > Extensions > Browse
2. Install **"Trigger Email from Firestore"**
3. Connect a SendGrid account (free tier: 100 emails/day)
4. Set the collection path to `mail`

## Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) > Developers > API Keys
   - Copy Publishable key to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy Secret key to `STRIPE_SECRET_KEY`
2. Create a Product with a recurring Price
   - Copy the Price ID to `STRIPE_PRO_PRICE_ID`
3. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Cookie Secrets

Generate secure cookie secrets for the auth middleware:

```bash
openssl rand -base64 32  # Use for COOKIE_SECRET_CURRENT
openssl rand -base64 32  # Use for COOKIE_SECRET_PREVIOUS
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |

## Project Structure

```
src/
├── app/                    # Pages and API routes
│   ├── (auth)/             # Login + Signup pages
│   ├── (dashboard)/        # Protected dashboard
│   ├── (legal)/            # Terms + Privacy pages
│   └── api/webhooks/       # Stripe webhook handler
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Auth form components
│   ├── landing/            # Landing page sections
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── firebase/           # Firebase SDK setup
│   ├── stripe/             # Stripe integration
│   └── firestore/          # Database helpers
├── hooks/                  # Custom React hooks
├── context/                # React context providers
├── types/                  # TypeScript definitions
└── middleware.ts           # Auth route protection
```

## Deployment to Vercel

1. Push your repo to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add all environment variables from `.env.local` to the Vercel project settings
4. Deploy

**Note:** For the `FIREBASE_ADMIN_PRIVATE_KEY` env var on Vercel, paste the full key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` markers. Vercel handles the newlines automatically.

After deploying, update your Stripe webhook endpoint to point to `https://your-domain.vercel.app/api/webhooks/stripe`.

## Course Notes

This boilerplate is part of a course on building SaaS with Claude Code. During the course, you will:

1. Set up your development environment and clone this template
2. Configure Firebase Auth and user management
3. Build the AI blog generation feature (the `blog-generator.tsx` stub)
4. Set up Stripe payments and subscription gating
5. Deploy to Vercel
6. Iterate with Claude Code's agentic workflow

## License

MIT
