# BlogAI Setup Guide

This guide maps to **Modules 1–5** of the course. By the end of Module 5, your app will be fully running locally and deployed live. Module 6 is where you build your own custom app from scratch.

**Claude Code handles most of the setup for you.** Once you have VS Code, the Claude Code extension, and the repo cloned (Module 1), just open the Claude Code chat panel and type `help me set up this project`. It will guide you through the rest.

The sections below explain what happens at each module, in case you want to understand the details or troubleshoot.

---

## Table of Contents

- [Module 1: Getting Started](#module-1-getting-started)
- [Module 2: Preparing the Environment](#module-2-preparing-the-environment)
- [Module 3: The Backend](#module-3-the-backend)
- [Module 4: AI and Payment Flow](#module-4-ai-and-payment-flow)
- [Module 5: Run Locally + Push to Live](#module-5-run-locally--push-to-live)
- [Troubleshooting](#troubleshooting)

---

## Module 1: Getting Started

*Install Tools, Clone, Claude Code*

### Step 1 — Get your boilerplate copy

Before writing a single line of code, you need your own copy of the SaaS boilerplate.

**1. Create a free GitHub account**

GitHub is where your code lives. You need a free account to receive and store your copy of the boilerplate.

Sign up at [github.com](https://github.com)

1. Enter your email address and choose a password
2. Pick a username — this will be public, keep it professional
3. Verify your email when prompted
4. You can skip all the optional setup steps

**2. Send your GitHub username to Ben**

Once you have your account, DM your GitHub username to Ben so you can be granted access to the private repo.

### Step 2 — Install your tools

You need two things: VS Code (your code editor) and Claude Code (your AI coding assistant). Once these are installed, Claude Code will handle everything else.

**1. Install VS Code**

Download it at [code.visualstudio.com](https://code.visualstudio.com)

1. Click **Download for Windows** (or Mac)
2. Run the installer — accept all defaults
3. Open VS Code when it's done

**2. Install the Claude Code extension**

1. In VS Code, click the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`)
2. Search for **Claude Code**
3. Click **Install** on the one by Anthropic
4. You'll need an Anthropic account — create one at [console.anthropic.com](https://console.anthropic.com) if you don't have one
5. Follow the prompts to sign in

**3. Open the project**

1. In VS Code, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type **"Clone Git Repository"** and select it
3. Paste your repo URL — this is the URL of your own copy from Step 1, found on your GitHub profile
4. Pick a folder (e.g., Documents) and click **Select as Repository Destination**
5. When prompted, click **Open** to open the project

> **If the clone fails**, make sure you've completed Step 1 and accepted the GitHub invitation from Ben — then try again.

**4. Let Claude Code set everything up**

1. Open the Claude Code chat panel in VS Code
2. Type:

```
help me set up this project
```

3. Claude Code reads the project's `CLAUDE.md` file and will:
   - Check if Git, Node.js, and pnpm are installed (and install what's missing)
   - Install the project dependencies
   - Create your environment config file
   - Walk you through setting up Firebase, Stripe, and OpenRouter — one at a time
   - Start the app when everything's ready

Just follow along — Claude Code will tell you exactly what to do at each step and where to go in your browser. When it asks you to paste something, paste it right into the chat.

---

## Module 2: Preparing the Environment

*Dependencies, Environment Config, Secrets*

**What Claude Code does automatically (no input needed):**

- Checks if Git, Node.js, and pnpm are installed — installs what's missing
- Runs `pnpm install` to install project dependencies
- Creates `.env.local` from `.env.example` if it doesn't exist
- Generates two cookie secrets and writes them to `.env.local`
- Sets `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### All config ends up in `.env.local`

Every value is written into a single file: **`.env.local`**. Nothing is hidden in other config files. If you ever need to check or change a value, that's the only place to look.

**This file is safe and private.** The `.gitignore` ignores all `.env*` files except `.env.example` (which only has empty placeholders). Your keys and secrets will never be committed to GitHub.

### Cookie Secrets

Claude Code generates these automatically. If you ever need to regenerate manually:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run it twice — one for `COOKIE_SECRET_CURRENT`, one for `COOKIE_SECRET_PREVIOUS`.

---

## Module 3: The Backend

*Firebase — Auth + Database*

Claude Code will prompt you for values from Firebase. Here's what you'll do in your browser:

### Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with a Google account
3. Click **"Create a project"** — name it whatever you like (e.g., `blogai-app`)
4. You can disable Google Analytics (not needed)
5. Click **"Create project"** and wait for it to finish

### Firebase Client Config

Where to find it: Firebase Console > Project Settings (gear icon) > Your apps > Web app

If you haven't registered a web app yet:
1. Click the web icon (`</>`)
2. Enter a nickname (e.g., `blogai-web`)
3. Skip Firebase Hosting setup
4. Click **Register app**

You'll see a `firebaseConfig` object like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Paste the whole thing to Claude Code. It maps to these `.env.local` values:

| Config key | Env variable |
|-----------|-------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

### Firebase Admin (Service Account)

Where to find it: Firebase Console > Project Settings > Service accounts > Generate new private key

This downloads a JSON file. Open it and paste the contents to Claude Code. It extracts:

| JSON key | Env variable |
|---------|-------------|
| `project_id` | `FIREBASE_ADMIN_PROJECT_ID` |
| `client_email` | `FIREBASE_ADMIN_CLIENT_EMAIL` |
| `private_key` | `FIREBASE_ADMIN_PRIVATE_KEY` |

**Important:** The private key in `.env.local` must be wrapped in double quotes with `\n` for newlines.

### Enable Auth & Create Firestore

These are quick toggles in the Firebase Console:

**Authentication:**
1. Click **Authentication** in the sidebar > **Get started**
2. Enable **Email/Password** (toggle on, save)

**Firestore:**
1. Click **Firestore Database** in the sidebar > **Create database**
2. Select **Start in test mode**
3. Pick the closest server location > **Enable**

---

## Module 4: AI and Payment Flow

*OpenRouter + Stripe — AI + Payments*

Claude Code will prompt you for these values next.

### OpenRouter (AI Blog Generation)

The blog generator uses [OpenRouter](https://openrouter.ai) to call Anthropic's Claude model. OpenRouter is an API gateway — you get one API key and can access many AI models through it.

1. Go to [https://openrouter.ai](https://openrouter.ai) and create an account
2. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys) and click **"Create Key"**
3. Copy the key (starts with `sk-or-...`)

| Value | Env variable |
|-------|-------------|
| API key | `OPENROUTER_API_KEY` |

**Note:** OpenRouter offers free credits for new accounts. The blog generator uses `anthropic/claude-sonnet-4-20250514` — check [OpenRouter pricing](https://openrouter.ai/models) for current costs.

### Stripe API Keys

Where to find them: Stripe Dashboard > Developers > API keys (make sure Test mode is ON)

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and create an account if you haven't
2. Make sure **Test mode** is ON (toggle in the top-right corner)
3. Go to Developers > API keys

| Key | Env variable |
|-----|-------------|
| Publishable key (`pk_test_...`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key (`sk_test_...`) | `STRIPE_SECRET_KEY` |

### Stripe Product & Price

1. Stripe Dashboard > Product catalog > **+ Add product**
2. Name: `Pro Plan` (or whatever you like)
3. Pricing: **Recurring**, $19/month (to match the pricing on the landing page)
4. Save, then copy the **Price ID** (`price_...`)

| Value | Env variable |
|-------|-------------|
| Price ID | `STRIPE_PRO_PRICE_ID` |

### Stripe Webhook Secret (for local testing)

1. Open a **separate terminal** (keep your main terminal free)
2. Run `stripe login` — a browser window opens, click **Allow access**
3. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret (`whsec_...`)

| Value | Env variable |
|-------|-------------|
| Signing secret | `STRIPE_WEBHOOK_SECRET` |

**Keep that terminal running** while testing payments locally.

> **Don't have Stripe CLI?** Claude Code can install it for you, or run `winget install Stripe.StripeCLI` (Windows) and restart your terminal.

---

## Module 5: Run Locally + Push to Live

*Launch Locally, Verify Everything, Deploy to Vercel*

### Launch Locally

Claude Code will start the dev server for you by running `pnpm dev`. Open [http://localhost:3000](http://localhost:3000) in your browser and verify each feature:

### Verification Checklist

1. **Landing page** — you should see the BlogAI landing page with hero, pricing, and footer
2. **Theme toggle** — click the sun/moon icon in the navbar to switch light/dark
3. **Legal pages** — click "Terms of Service" and "Privacy Policy" in the footer
4. **Sign up** — go to `/signup` and create an account (email and password)
5. **Log in** — go to `/login` and sign in
6. **Dashboard** — after login, you should see the dashboard with the blog generator
7. **Blog generation** — enter a topic, pick a tone, click Generate. The blog post should stream in. Click "Save as Draft" to save it.
8. **Stripe checkout** — on the pricing page, click Subscribe. Use test card: `4242 4242 4242 4242` (any future date, any CVC)

### Deploy to Vercel

When you're ready to go live:

1. Create an account at [https://vercel.com](https://vercel.com) (sign up with GitHub)
2. Click **Add New... > Project** and import your repository
3. Add all your `.env.local` variables to the Vercel Environment Variables section
4. Change `NEXT_PUBLIC_APP_URL` to your Vercel domain (e.g., `https://my-app.vercel.app`)
5. Click **Deploy**

For production Stripe webhooks:
1. Stripe Dashboard > Developers > Webhooks > **Add endpoint**
2. URL: `https://your-app.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the new signing secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

If everything works locally and on Vercel, you're done! Your boilerplate is fully set up. You're ready for Module 6 — building your own custom app.

---

## Troubleshooting

### Prerequisites

| Problem | Solution |
|---------|----------|
| `pnpm: command not found` | Run `npm install -g pnpm`, then restart your terminal |
| `git: command not found` | Install Git from https://git-scm.com/download/win, restart VS Code |
| `node: command not found` | Install Node.js LTS from https://nodejs.org, restart VS Code |
| `stripe: command not found` | Run `winget install Stripe.StripeCLI`, restart terminal |

### Running the App

| Problem | Solution |
|---------|----------|
| `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND` | You're in the wrong folder. `cd` to the folder with `package.json` |
| `Module not found: Can't resolve ...` | Run `pnpm install` again |
| Blank page or console errors | Check `.env.local` — make sure every value is filled in |
| Port 3000 already in use | Run `pnpm dev -- -p 3001` |

### Firebase

| Problem | Solution |
|---------|----------|
| Auth not working | Check that Email/Password and Google are enabled in Firebase Console |
| `FIREBASE_ADMIN_PRIVATE_KEY` errors | Make sure the value is wrapped in double quotes in `.env.local` |
| Firestore permission denied | Make sure you created the database in "test mode" |

### OpenRouter / Blog Generation

| Problem | Solution |
|---------|----------|
| "OpenRouter API key is not configured" | Add `OPENROUTER_API_KEY` to `.env.local` and restart the dev server |
| "Failed to generate blog post" | Check your OpenRouter API key is correct and your account has credits |
| Blog generation is slow | This is normal — the AI model streams the response as it writes |

### Stripe

| Problem | Solution |
|---------|----------|
| Checkout not redirecting | Verify all 4 Stripe env vars are filled in and correct |
| Webhooks not received locally | Make sure `stripe listen` is running in a separate terminal |
| `openssl` not recognized | Use `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` instead |
