# Deployment Guide — Synthetic Persona Web

This document explains how to deploy the application to production using Vercel, including the database requirements.

---

## 1. Prerequisites
- GitHub repository with the project code.
- Vercel account linked to GitHub.
- Node.js and Docker installed locally for running setup scripts.

---

## 2. Environment Variables

Set these in **Project → Settings → Environment Variables**.

| Variable         | Required For | Description                                                   |
| ---------------- | ------------ | ------------------------------------------------------------- |
| `POSTGRES_URL`   | Production   | Connection string for Vercel Postgres (Neon).                |
| `OPENAI_API_KEY` | Production   | OpenAI API key.                                               |
| `OPENAI_MODEL`   | Optional     | Override model (defaults to `gpt-4o-mini`).                   |

Important: ensure `POSTGRES_URL` is available during the **Build** phase.

---

## 3. Vercel Deployment

### First-Time Setup

1) Go to **Vercel Dashboard → Add New Project**.
2) Import your GitHub repository.
3) **Create and Link a Database**:
   - In the project configuration, go to **Storage**.
   - Select **Postgres** (Neon) and create a database.
   - Connect it to your project (adds `POSTGRES_URL`).
4) **Add Remaining Environment Variables**: add `OPENAI_API_KEY` (and optional `OPENAI_MODEL`).
5) Deploy. The first build may succeed but the app will be non‑functional until the DB is seeded.

### Populate the Production Database (Critical)

1) Copy `POSTGRES_URL` from Vercel.
2) Run schema setup against production:
```bash
POSTGRES_URL="YOUR_VERCEL_CONNECTION_STRING" npm run db:setup
```
3) Run ingestion against production:
```bash
POSTGRES_URL="YOUR_VERCEL_CONNECTION_STRING" OPENAI_API_KEY="YOUR_OPENAI_KEY" npm run embed
```

### Subsequent Deployments
- `main` branch auto‑deploys to production.
- Pull Requests auto‑deploy to preview URLs.
- If you change data in `/data`, re‑run `npm run embed` against production.

---

## 4. Troubleshooting

- **Build Error: `Database connection string is not set`**
  - Cause: `POSTGRES_URL` not available during build.
  - Fix: enable `POSTGRES_URL` for the **Build** scope in Vercel.

- **Preview App loads but shows errors or no data**
  - Cause: DB not seeded.
  - Fix: run `db:setup` + `embed` against the preview DB URL.

- **500 error on API routes**
  - Cause: `OPENAI_API_KEY` missing/invalid.
  - Fix: verify env vars in Vercel.

