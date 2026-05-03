# 🚀 Deploy Stride — Railway (backend) + Vercel (frontend)

Step-by-step guide for the exact stack in this repo.

> Already done for you in the codebase:
> - `backend/railway.json` — Nixpacks builder + healthcheck on `/api/health` + auto-restart
> - `backend/Procfile` — fallback start command
> - `frontend/vercel.json` — SPA rewrites + asset cache headers
> - CORS supports `*.vercel.app` wildcards so preview deployments work

---

## 0) Push the code to GitHub

```bash
cd d:/Downloads/task
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

> Make sure `.env` files are NOT pushed — both `.gitignore` files already exclude them.

---

## 1) Backend → Railway

### 1.1 Create the service
1. Go to **https://railway.com/new** and pick **"Deploy from GitHub repo"**.
2. Select your repo. Railway will create a service.
3. Open the service → **Settings** tab.

### 1.2 Configure the build
- **Root Directory** → `backend`
- **Build Command** → leave blank (Nixpacks auto-detects)
- **Start Command** → leave blank (uses `npm start` from `package.json` / `Procfile`)
- **Watch Paths** (Settings → Deploy) → `backend/**` (so frontend changes don't redeploy)

### 1.3 Environment variables (Settings → Variables)
Click **"+ New Variable"** for each:

```
NODE_ENV=production
JWT_SECRET=<paste a 64+ char random string — see below to generate>
JWT_EXPIRES_IN=7d
MONGO_URI=<your MongoDB Atlas connection string — keep the same one you're using locally>
CLIENT_ORIGINS=https://*.vercel.app,http://localhost:5173
```

> Generate a strong JWT secret:
> ```powershell
> [Convert]::ToBase64String((1..48 | %{ Get-Random -Maximum 256 }))
> ```
> or in any Node REPL: `require('crypto').randomBytes(48).toString('base64')`

> **Don't set `PORT`** — Railway injects it automatically and the code already reads `process.env.PORT`.

### 1.4 Generate a public domain
- Settings → Networking → **Generate Domain**.
- You'll get something like `stride-api-production.up.railway.app`.
- Visit `https://stride-api-production.up.railway.app/api/health` — should return:
  ```json
  { "status": "ok", "uptime": 3.42, "timestamp": "..." }
  ```

✅ Backend done. **Copy the Railway URL** — you need it for Vercel.

---

## 2) Frontend → Vercel

### 2.1 Import the repo
1. Go to **https://vercel.com/new** → import the same GitHub repo.
2. Vercel will show **"Configure Project"**.

### 2.2 Configure
- **Framework Preset** → Vite (auto-detected)
- **Root Directory** → click "Edit" → select `frontend`
- **Build Command** → `npm run build` (auto-filled)
- **Output Directory** → `dist` (auto-filled)
- **Install Command** → `npm install`

### 2.3 Environment variables (before first deploy)
Click **"Environment Variables"** and add:

```
VITE_API_URL = https://<your-railway-domain>/api
```

> Important: include `/api` at the end. Apply to all environments (Production, Preview, Development).

Click **Deploy**.

### 2.4 First deploy will succeed but...
You'll get a URL like `https://stride-xxxxx.vercel.app`. Visit it — login form will load.

If the API call fails with CORS, your `CLIENT_ORIGINS` on Railway already includes `*.vercel.app` so it should work. If you used a custom domain on Vercel, add it explicitly:
```
CLIENT_ORIGINS=https://*.vercel.app,https://stride.yourdomain.com
```

---

## 3) Sanity check

| Check | How |
|---|---|
| Backend healthy | `https://<railway>/api/health` returns `{status:"ok"}` |
| Frontend served | `https://<vercel>/login` loads the auth page |
| API reachable from frontend | Sign in with seeded user — should redirect to dashboard |
| CORS configured | Network tab shows `Access-Control-Allow-Origin` matching the Vercel domain |
| DB writes | Create a project on the live site, refresh — it persists |

---

## 4) Post-deploy hardening (recommended)

- [ ] **Rotate `JWT_SECRET`** to a fresh 64-char string (existing tokens get invalidated, which is fine on first launch)
- [ ] **Restrict Atlas IP allowlist** to Railway's outbound IP ranges, or accept the broader 0.0.0.0/0 for now
- [ ] **Add a custom domain** on Vercel (Settings → Domains) and add it to `CLIENT_ORIGINS`
- [ ] **Set up Atlas backups** (Free tier includes daily snapshots)
- [ ] **Enable Railway alerts** so you get notified on crashes

---

## 5) Updating after first deploy

Both platforms auto-deploy on `git push`:
- Push to `main` → Railway redeploys backend, Vercel redeploys frontend
- Open a PR → Vercel creates a preview at `https://<branch>-<repo>.vercel.app` (already allowed by the wildcard CORS)

To update env vars on Railway → Variables tab → save → it triggers a redeploy.
To update env vars on Vercel → Settings → Environment Variables → **redeploy from the Deployments tab** (Vercel doesn't auto-redeploy on env changes).

---

## Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `CORS: origin … not allowed` | Frontend domain not in `CLIENT_ORIGINS` | Add it (or `*.vercel.app`) on Railway → restart |
| Frontend builds but API calls 404 | Missing `/api` in `VITE_API_URL` | Set `VITE_API_URL=https://…/api` and redeploy on Vercel |
| 500 on login | `JWT_SECRET` not set | Add it on Railway |
| `EADDRINUSE` in Railway logs | You set `PORT` manually | Remove it — Railway sets it automatically |
| Reload on `/dashboard` returns 404 | SPA fallback not configured | Already fixed via `frontend/vercel.json` |
| Mongoose `Server selection timed out` | Atlas IP allowlist blocking Railway | In Atlas → Network Access → add `0.0.0.0/0` (or Railway IPs) |
