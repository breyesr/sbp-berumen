# Environment Configuration

This document describes the environment configuration for Synthetic Persona Web.

---

## 1. Node & Framework Versions
- **Node.js**: >=20.x
- **Next.js**: 16.x
- **TypeScript**: 5.x
- **Package Manager**: npm

---

## 2. Environment Variables

All sensitive or environment‑dependent values should be defined via `.env.local` (local dev) or Vercel Environment Variables (preview/production).

### Core Variables

| Variable             | Scope     | Description                                                                 |
| -------------------- | --------- | --------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | All       | **Required**. OpenAI API key used for chat + embeddings.                   |
| `POSTGRES_URL_LOCAL` | Local     | **Required**. Local Postgres connection string (Docker).                   |
| `POSTGRES_URL`       | Vercel    | **Required**. Production/preview Postgres connection string.               |
| `OPENAI_MODEL`       | Optional  | Override for chat model (defaults to `gpt-4o-mini`).                        |
| `NEXT_PUBLIC_STRESS_DEBUG` | Optional | If set to `1`, enables debug payloads for stress-test.                 |

Notes:
- `src/lib/clients.ts` validates DB + OpenAI env vars at module load time. If these are missing, API routes that import persona/RAG helpers will fail.

---

## 3. Local Environment Setup

1) Copy the example file:
```bash
cp .env.example .env.local
```

2) Edit `.env.local` and add your `OPENAI_API_KEY`. The example includes `POSTGRES_URL_LOCAL` for Docker.

Example `.env.local`:
```env
# For local Docker database
POSTGRES_URL_LOCAL="postgresql://user:password@localhost:5433/persona_db"

# For OpenAI API
OPENAI_API_KEY="sk-xxxxxx"
```

---

## 4. Vercel Environments (Preview & Production)

Set the following in **Project → Settings → Environment Variables**:
- `POSTGRES_URL` (from your Vercel Postgres/Neon database)
- `OPENAI_API_KEY`

---

## 5. Security Best Practices
- Never commit `.env.local` or other secrets.
- Mark API keys as “Sensitive” in Vercel.
- Keep `.env.example` updated when new variables are introduced.

