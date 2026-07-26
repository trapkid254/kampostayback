# KampoStay API

Express + MongoDB backend for KampoStay.

## Local run

```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

API: `http://localhost:5000/api/v1`  
Health: `http://localhost:5000/api/v1/health`

## Deploy on Render (kampostayback repo)

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
2. Connect repo: `https://github.com/trapkid254/kampostayback`
3. Settings:
   - **Root Directory:** leave **empty** (repo root is the API)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/v1/health`
4. Environment variables (required):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | long random string |
| `JWT_REFRESH_SECRET` | long random string |
| `COOKIE_SECRET` | long random string |
| `CLIENT_URL` | `https://trapkid254.github.io` |
| `APP_URL` | your Render URL, e.g. `https://kampostay-api.onrender.com` |

5. MongoDB Atlas → Network Access → allow `0.0.0.0/0` (so Render can connect)
6. After deploy, open: `https://YOUR-SERVICE.onrender.com/api/v1/health`

### Common failures

- **Failed to fetch api.render.com** in the browser: VPN/ad-blocker/network blocking Render’s dashboard — try another browser, disable extensions, or mobile hotspot.
- **Deploy succeeds but health check fails:** wrong Root Directory (`backend` when repo is already backend-only), missing `MONGODB_URI`, or Atlas IP not allowed.
- **Free tier sleep:** first request after idle can take ~30–60s.

### Point the frontend at this API

On GitHub Pages / frontend, set:

```html
<meta name="kampostay-api-base" content="https://YOUR-SERVICE.onrender.com/api/v1">
```
