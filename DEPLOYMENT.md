# Deployment Guide

## Overview
This guide explains how to deploy **Maren** — the backend on [Render](https://render.com) and the frontend on [Vercel](https://vercel.com).

---

## ⚡ Recommended Deployment Order

Because of the CORS chicken-and-egg problem (backend needs the frontend URL, frontend needs the backend URL), follow this exact order:

```
1. Deploy backend on Render  → set CLIENT_URL=* temporarily
2. Copy your Render URL      → use it in Vercel as NEXT_PUBLIC_API_URL
3. Deploy frontend on Vercel → copy your Vercel URL
4. Update CLIENT_URL on Render with the real Vercel URL → auto-redeploys ✅
```

---

## 🖥️ Backend — Render

### 1. Create a Web Service
- Go to [render.com](https://render.com) → **New → Web Service**
- Connect your GitHub repo (`Bhavyagautam08/Ecommerce-`)
- Set **Root Directory** to `backend`

### 2. Configure build settings
| Setting | Value |
|---|---|
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### 3. Add Environment Variables
| Variable | Value |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random string |
| `REFRESH_TOKEN_SECRET` | A different strong random string |
| `CLIENT_URL` | `*` ← set this temporarily, update after frontend deploy |
| `SMTP_EMAIL` | Your Gmail address |
| `SMTP_PASSWORD` | Your 16-char Gmail App Password |

> **Note:** `PORT` and `REDIS_URL` do not need to be set on Render.

### 4. Deploy
Click **Create Web Service**. Your backend URL will be:
```
https://<your-service-name>.onrender.com
```

---

## 🌐 Frontend — Vercel

### 1. Import Project
- Go to [vercel.com](https://vercel.com) → **New Project**
- Import the same GitHub repo
- Set **Root Directory** to `frontend`

### 2. Add Environment Variable
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<your-service-name>.onrender.com/api/v1` |

### 3. Deploy
Click **Deploy**. Your frontend URL will be:
```
https://<your-project-name>.vercel.app
```

---

## 🔄 Final Step — Update CORS on Render

1. Go to your Render service → **Environment** tab
2. Update `CLIENT_URL` from `*` to your real Vercel URL:
   ```
   CLIENT_URL=https://<your-project-name>.vercel.app
   ```
3. Render will automatically redeploy with the correct CORS configuration.

---

## ✅ Verify Deployment

Once both are live, test these endpoints:

- `GET https://<backend>.onrender.com/api/v1/health` → should return `200 OK`
- Open your Vercel URL in the browser → app should load and connect to the backend

---

## 🔐 Gmail App Password Setup

If you haven't set up your Gmail App Password yet:

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required)
3. Search for **App Passwords**
4. Select app: `Mail`, device: `Other` → name it `Maren`
5. Copy the 16-character password → use it as `SMTP_PASSWORD`
