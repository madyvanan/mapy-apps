# Magizhthunnu — Food Delivery App

A full-stack food delivery application built with the MERN stack, TypeScript, Socket.IO real-time order tracking, Paytm payments, and Tamil/English language switching.

**Stack:** React 18 · Node 22 · MongoDB 7 · Redis 8 · Socket.IO 4 · Paytm · react-i18next · Tailwind CSS · Docker

> Part of the [mapy-apps](../README.md) monorepo. This app is fully self-contained — see [../docs/](../docs/) for repo-wide conventions.

---

## Prerequisites

Before starting, make sure the following are installed on your machine:

| Tool | Version | Install |
|---|---|---|
| Node.js | 22+ | [nodejs.org](https://nodejs.org) |
| npm | 10+ | Included with Node |
| MongoDB | 7+ | `brew tap mongodb/brew && brew install mongodb-community` |
| Redis | 7+ | `brew install redis` |
| Homebrew | any | [brew.sh](https://brew.sh) (macOS) |

Check your versions:

```bash
node --version    # v22.x.x
npm --version     # 10.x.x
mongod --version  # db version v7.x.x
redis-server --version  # Redis server v=8.x.x
```

---

## Local Development Setup

### Step 1 — Clone and install dependencies

```bash
# Clone the repo
git clone <your-repo-url>
cd magizhthunnu

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

> If you already have the project folder, skip the clone. Dependencies are already installed if `node_modules/` exists.

---

### Step 2 — Start MongoDB and Redis

Open a terminal and run:

```bash
brew services start mongodb-community
brew services start redis
```

Verify both are running:

```bash
brew services list | grep -E "mongodb|redis"
```

You should see `started` next to both.

> **MongoDB not found?** Try `brew services start mongodb-community@7.0`

To stop them later:

```bash
brew services stop mongodb-community
brew services stop redis
```

---

### Step 3 — Create the backend `.env`

```bash
cd backend
cp .env.example .env
```

Generate two secure JWT secrets (run each command separately and copy the output):

```bash
openssl rand -hex 32   # → paste as JWT_SECRET
openssl rand -hex 32   # → paste as JWT_REFRESH_SECRET
```

Open `backend/.env` and update these two lines:

```env
JWT_SECRET=<paste first output here>
JWT_REFRESH_SECRET=<paste second output here>
```

The rest of the defaults work for local development as-is:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/magizhthunnu
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:3000
```

> **Cloudinary and Paytm** — leave these blank for now. The app runs without them locally; only image uploads and payment flows will be non-functional.

---

### Step 4 — Create the frontend `.env`

```bash
cd ../frontend
cp .env.example .env
```

No changes needed — the defaults point to `localhost:5000`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_PAYTM_MID=
```

---

### Step 5 — Start the backend

Open **Terminal 1** and run:

```bash
cd backend
npm run dev
```

Expected output:

```
[nodemon] starting `ts-node src/server.ts`
MongoDB connected
Server running on port 5000 [development]
```

Verify the backend is running:

```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"..."}
```

---

### Step 6 — Start the frontend

Open **Terminal 2** and run:

```bash
cd frontend
npm run dev
```

Expected output:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

---

### Step 7 — Open the app

Go to **http://localhost:5174** in your browser.

The Vite dev server automatically proxies all `/api` and `/socket.io` requests to `localhost:5000` — no CORS issues in development.

---

## Quick Reference

| Service | Start command | URL / Port |
|---|---|---|
| MongoDB | `brew services start mongodb-community` | `localhost:27017` |
| Redis | `brew services start redis` | `localhost:6379` |
| Backend | `npm run dev` (in `backend/`) | `http://localhost:5000` |
| Frontend | `npm run dev` (in `frontend/`) | `http://localhost:5174` |
| Health check | `curl http://localhost:5000/health` | — |

> You need **2 terminals** — one for backend, one for frontend. MongoDB and Redis run as background services.

---

## Available Scripts

### Backend (`cd backend`)

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed the database with sample data |

### Frontend (`cd frontend`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run oxlint |

---

## Run with Docker (alternative)

Instead of running MongoDB, Redis, backend, and frontend separately, you can run everything with a single command:

```bash
# From the project root
cp backend/.env.example backend/.env   # fill in JWT secrets first
cp frontend/.env.example frontend/.env

docker compose up
```

This starts all 5 services: MongoDB, Redis, backend, frontend, and nginx (port 80).

---

## Project Structure

```
magizhthunnu/
├── frontend/          # React 18 + Vite + TypeScript
│   └── src/
│       ├── pages/     # 15 pages (home, restaurants, cart, orders, auth, dashboards)
│       ├── context/   # AuthContext, CartContext
│       ├── i18n/      # Tamil / English translations
│       └── hooks/     # useSocket (real-time order tracking)
├── backend/           # Node 22 + Express + TypeScript
│   └── src/
│       ├── routes/    # 8 API modules
│       ├── models/    # 7 MongoDB collections
│       ├── services/  # Business logic + Socket.IO + BullMQ queues
│       └── middleware/# Auth (JWT), validation (Zod), rate limiting
├── docker-compose.yml
├── nginx.conf
└── .github/workflows/ # CI (lint + test) and CD (Vercel + Render)
```

---

## Environment Variables Reference

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` / `production` / `test` |
| `PORT` | Yes | Express server port (default `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `REDIS_URL` | Yes | Redis connection URL |
| `JWT_SECRET` | Yes | 32+ char random string for access tokens |
| `JWT_REFRESH_SECRET` | Yes | 32+ char random string for refresh tokens |
| `ALLOWED_ORIGINS` | Yes | Comma-separated frontend URLs for CORS |
| `PAYTM_MID` | No* | Paytm Merchant ID (required for payments) |
| `PAYTM_MERCHANT_KEY` | No* | Paytm Merchant Key (required for payments) |
| `CLOUDINARY_CLOUD_NAME` | No* | Cloudinary (required for image uploads) |
| `CLOUDINARY_API_KEY` | No* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No* | Cloudinary API secret |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (`http://localhost:5000/api` for dev) |
| `VITE_SOCKET_URL` | Socket.IO server URL (`http://localhost:5000` for dev) |
| `VITE_PAYTM_MID` | Paytm Merchant ID (required for payment UI) |

---

## Features

- **Restaurant discovery** — browse, search, filter by cuisine, proximity search
- **Cart** — add items, update quantities, cross-restaurant guard
- **Orders** — place orders with Paytm payment, real-time status tracking via Socket.IO
- **Auth** — JWT in httpOnly cookies, role-based access (Customer / Restaurant Owner / Admin)
- **Language switching** — full Tamil / English UI toggle, persists across sessions
- **Restaurant dashboard** — manage menu items and incoming orders
- **Admin dashboard** — user management, restaurant verification, analytics

---

## Known Issues

- **Paytm payments** require valid `PAYTM_MID` and `PAYTM_MERCHANT_KEY` credentials from the [Paytm Developer Portal](https://developer.paytm.com). The sandbox (staging) environment works with test credentials.
- **Image uploads** require a free [Cloudinary](https://cloudinary.com) account.
- The `verifyPaytmChecksum` function in `backend/src/services/payment.service.ts` is a placeholder — replace it with `PaytmChecksum.verifySignature` from the official Paytm Node SDK before going to production.

---

## Git Workflow

```bash
# Never commit directly to main
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "feat: describe what and why"

# Push and open a PR
git push origin feature/your-feature-name
```

Branch naming: `feature/short-description` · `fix/short-description`

Never commit `.env` files — they are gitignored.

---

## Production Deployment

The app deploys to:

| Layer | Service | Free Tier |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Yes |
| Backend | [Render](https://render.com) | Yes |
| Database | [MongoDB Atlas](https://cloud.mongodb.com) | Yes (512 MB) |
| Cache / Queue | [Upstash Redis](https://upstash.com) | Yes (10k cmd/day) |
| Images | [Cloudinary](https://cloudinary.com) | Yes (25 credits/mo) |
| CI / CD | GitHub Actions | Yes |

> All free tiers are sufficient for a production launch. Upgrade only when you have real traffic.

---

### Step 1 — Push code to GitHub

**1.1** Create a new repository on [github.com](https://github.com/new):
- Name: `magizhthunnu`
- Visibility: Private (recommended)
- Do **not** add a README or .gitignore — the project already has them

**1.2** Initialise git and push from your local machine:

```bash
cd /Users/mathivanan.s/Desktop/Mathi/magizhthunnu

git init
git add .
git commit -m "feat: initial full-stack implementation"
git branch -M main
git remote add origin https://github.com/<your-username>/magizhthunnu.git
git push -u origin main
```

Replace `<your-username>` with your GitHub username.

---

### Step 2 — Set up MongoDB Atlas (cloud database)

**2.1** Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Sign up / Log in

**2.2** Create a free cluster:
- Click **Build a Database** → choose **Free (M0)**
- Provider: AWS · Region: pick closest to India (e.g. `ap-south-1` Mumbai)
- Cluster name: `magizhthunnu`
- Click **Create**

**2.3** Create a database user:
- Go to **Database Access** → **Add New Database User**
- Auth method: Password
- Username: `magizhthunnu-user`
- Password: click **Autogenerate** and copy it
- Role: **Atlas Admin**
- Click **Add User**

**2.4** Allow network access:
- Go to **Network Access** → **Add IP Address**
- Click **Allow Access from Anywhere** (`0.0.0.0/0`) for now
- Click **Confirm**

> For better security later, whitelist only Render's outbound IPs.

**2.5** Get the connection string:
- Go to **Database** → **Connect** → **Drivers**
- Copy the connection string — it looks like:
  ```
  mongodb+srv://magizhthunnu-user:<password>@magizhthunnu.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- Replace `<password>` with the password you copied in Step 2.3
- Add the database name before the `?`:
  ```
  mongodb+srv://magizhthunnu-user:<password>@magizhthunnu.xxxxx.mongodb.net/magizhthunnu?retryWrites=true&w=majority
  ```
- **Save this string** — you'll need it in Step 4.

---

### Step 3 — Set up Upstash Redis (cloud cache)

**3.1** Go to [upstash.com](https://upstash.com) → Sign up with GitHub

**3.2** Create a database:
- Click **Create Database**
- Name: `magizhthunnu-redis`
- Type: Regional · Region: `ap-southeast-1` (Singapore, closest to India)
- Click **Create**

**3.3** Get the Redis URL:
- On the database page, scroll to **REST API** section
- Copy the **UPSTASH_REDIS_URL** — it looks like:
  ```
  rediss://:<password>@<host>.upstash.io:6379
  ```
- **Save this URL** — you'll need it in Step 4.

---

### Step 4 — Set up Cloudinary (image storage)

**4.1** Go to [cloudinary.com](https://cloudinary.com) → Sign up for free

**4.2** After login, go to your **Dashboard**

**4.3** Copy these three values from the dashboard:
- **Cloud name**
- **API Key**
- **API Secret**

**Save all three** — you'll need them in Step 5.

---

### Step 5 — Deploy the backend to Render

**5.1** Go to [render.com](https://render.com) → Sign up with GitHub

**5.2** Create a new Web Service:
- Click **New** → **Web Service**
- Connect your GitHub account if prompted
- Select the `magizhthunnu` repository
- Click **Connect**

**5.3** Configure the service:

| Setting | Value |
|---|---|
| Name | `magizhthunnu-backend` |
| Region | Singapore (closest to India) |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `node dist/server.js` |
| Instance Type | Free |

**5.4** Add environment variables — click **Environment** → **Add Environment Variable** for each:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | *(connection string from Step 2.5)* |
| `REDIS_URL` | *(Upstash URL from Step 3.3)* |
| `JWT_SECRET` | *(run `openssl rand -hex 32` and paste)* |
| `JWT_REFRESH_SECRET` | *(run `openssl rand -hex 32` again and paste)* |
| `CLOUDINARY_CLOUD_NAME` | *(from Step 4.3)* |
| `CLOUDINARY_API_KEY` | *(from Step 4.3)* |
| `CLOUDINARY_API_SECRET` | *(from Step 4.3)* |
| `PAYTM_MID` | *(your Paytm Merchant ID)* |
| `PAYTM_MERCHANT_KEY` | *(your Paytm Merchant Key)* |
| `PAYTM_WEBSITE` | `DEFAULT` |
| `PAYTM_BASE_URL` | `https://securegw.paytm.in` |
| `ALLOWED_ORIGINS` | `https://magizhthunnu.vercel.app` *(update after Step 6)* |

**5.5** Click **Create Web Service**

Render will install dependencies, build, and start the backend. The first deploy takes 3–5 minutes.

**5.6** Copy your backend URL — it will look like:
```
https://magizhthunnu-backend.onrender.com
```

**Save this URL** — you'll need it in Step 6.

**5.7** Verify the backend is live:
```
https://magizhthunnu-backend.onrender.com/health
```
Should return: `{"status":"ok","timestamp":"..."}`

---

### Step 6 — Deploy the frontend to Vercel

**6.1** Go to [vercel.com](https://vercel.com) → Sign up with GitHub

**6.2** Import the project:
- Click **Add New** → **Project**
- Select the `magizhthunnu` repository
- Click **Import**

**6.3** Configure the project:

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**6.4** Add environment variables — click **Environment Variables**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://magizhthunnu-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://magizhthunnu-backend.onrender.com` |
| `VITE_PAYTM_MID` | *(your Paytm Merchant ID)* |

**6.5** Click **Deploy**

Vercel builds and deploys in 1–2 minutes. Your frontend URL will be:
```
https://magizhthunnu.vercel.app
```
(Vercel may add a suffix like `magizhthunnu-xyz.vercel.app` — use the exact URL shown)

---

### Step 7 — Update ALLOWED_ORIGINS on Render

Now that you have the Vercel URL, go back to Render:

- **Dashboard** → `magizhthunnu-backend` → **Environment**
- Update `ALLOWED_ORIGINS` to your actual Vercel URL:
  ```
  https://magizhthunnu.vercel.app
  ```
- Click **Save Changes** — Render will automatically redeploy the backend.

---

### Step 8 — Set up GitHub Actions secrets (CI/CD auto-deploy)

This wires up automatic deployment: every merge to `main` deploys the frontend to Vercel and triggers the backend redeploy on Render.

**8.1** Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add each of the following secrets:

| Secret Name | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel → Account Settings → General → Your ID |
| `VERCEL_PROJECT_ID` | Vercel → Project → Settings → General → Project ID |
| `VITE_API_URL` | `https://magizhthunnu-backend.onrender.com/api` |
| `VITE_PAYTM_MID` | Your Paytm Merchant ID |
| `RENDER_DEPLOY_HOOK_URL` | Render → Service → Settings → Deploy Hook → Create Hook → copy URL |

**8.2** Get the Vercel IDs:

```bash
# Install Vercel CLI
npm install -g vercel

# Login and link the project (run from frontend/ folder)
cd frontend
vercel login
vercel link

# The .vercel/project.json file now shows orgId and projectId
cat .vercel/project.json
```

**8.3** Get the Render deploy hook:
- Render → `magizhthunnu-backend` → **Settings** → scroll to **Deploy Hook**
- Click **Create Deploy Hook** → copy the URL

---

### Step 9 — Verify the full CI/CD pipeline

Make a small change, push to a feature branch, and open a pull request:

```bash
git checkout -b test/verify-cicd
echo "# test" >> README.md
git add README.md
git commit -m "test: verify CI/CD pipeline"
git push origin test/verify-cicd
```

- GitHub Actions runs **CI** automatically (lint → tsc → tests)
- Check the **Actions** tab on GitHub — both backend and frontend jobs should pass ✅
- Merge the PR to `main` → GitHub Actions runs **CD** → Vercel and Render redeploy automatically

---

### Step 10 — Test the production app

Open your Vercel URL and verify:

- [ ] Home page loads with restaurant listings
- [ ] Language switcher toggles Tamil / English
- [ ] Register a new account (Customer role)
- [ ] Login and logout
- [ ] Browse restaurants and menu items
- [ ] Add items to cart
- [ ] Backend health check: `https://magizhthunnu-backend.onrender.com/health`

---

## Production Architecture

```
User Browser
     │
     ▼
Vercel (React frontend)
https://magizhthunnu.vercel.app
     │
     │ /api/*  →
     │ /socket.io/*  →
     ▼
Render (Express backend)
https://magizhthunnu-backend.onrender.com
     │
     ├──▶ MongoDB Atlas (database)
     │    mongodb+srv://...mongodb.net/magizhthunnu
     │
     └──▶ Upstash Redis (cache + sessions + queues)
          rediss://...upstash.io:6379
```

---

## Production Environment Variables Summary

### Backend (set on Render)

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `REDIS_URL` | Upstash Redis URL |
| `JWT_SECRET` | 64-char random string |
| `JWT_REFRESH_SECRET` | 64-char random string (different from above) |
| `ALLOWED_ORIGINS` | Your Vercel frontend URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard |
| `PAYTM_MID` | Paytm Developer Portal |
| `PAYTM_MERCHANT_KEY` | Paytm Developer Portal |
| `PAYTM_WEBSITE` | `DEFAULT` (production) or `WEBSTAGING` (sandbox) |
| `PAYTM_BASE_URL` | `https://securegw.paytm.in` (production) |

### Frontend (set on Vercel)

| Variable | Description |
|---|---|
| `VITE_API_URL` | `https://magizhthunnu-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://magizhthunnu-backend.onrender.com` |
| `VITE_PAYTM_MID` | Paytm Merchant ID |

---

## Render Free Tier Note

The Render free tier **spins down** after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds to respond (cold start). To avoid this:
- Upgrade to Render Starter ($7/month) for always-on service
- Or use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping `/health` every 10 minutes and keep the service warm

---

## Custom Domain (optional)

**Vercel:**
- Project → **Domains** → Add your domain → Follow DNS instructions

**Render:**
- Service → **Settings** → **Custom Domain** → Add your domain → Follow DNS instructions

Once both are set, update `ALLOWED_ORIGINS` on Render to your custom domain.
