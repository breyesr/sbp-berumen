# Synthetic Persona Web — Documentation Hub

Welcome to the documentation for the Synthetic Persona Web project. This hub serves as the central point for understanding the system architecture, development workflows, and live project status.

---

## 🚀 Quickstart (Local Development)

```bash
npm install
cp .env.example .env.local
docker-compose up -d
npm run db:setup
npm run db:auth:setup
npm run db:locale:migrate # Existing DB upgrade only
npm run embed
npm run dev
# open: http://localhost:3000
```

---

## 🗺️ Documentation Pillars

### 🏛️ [Architecture](./architecture)
*   [**Design Architecture**](./architecture/DESIGN.md) — System-wide design principles and layout.
*   [**Design System**](./architecture/DESIGN_SYSTEM.md) — UI/UX components and styling guidelines.
*   [**Page Protection**](./architecture/PAGE_PROTECTION.md) — RBAC and route-level security.
*   [**I18N Implementation**](./architecture/I18N_IMPLEMENTATION.md) — Multi-language support and routing.
*   [**Scalability Assessment**](./architecture/SCALABILITY_ASSESSMENT.md) — Current state audit and remediation plan.
*   [**UX Wireframes**](./architecture/UX_WIREFRAMES.md) — Visual flow and interface design.

### 📖 [Guides](./guides)
*   [**Contributing**](./guides/CONTRIBUTING.md) — How to contribute to this repository.
*   [**Deployment**](./guides/DEPLOYMENT.md) — Vercel deployment and database runbook.
*   [**Environment**](./guides/ENVIRONMENT.md) — Detailed environment variable configuration.
*   [**Testing**](./guides/TESTING.md) — QA checklist and manual testing protocols.

### 📚 [Reference](./reference)
*   [**API Reference**](./reference/API.md) — Comprehensive API endpoint documentation.
*   [**I18N Glossary**](./reference/I18N_GLOSSARY.md) — Bilingual terminology and translations.

### 📈 [Project Status](./project)
*   [**Product Backlog**](./project/BACKLOG.md) — Prioritized epics and tasks.
*   [**Handoff State**](./project/HANDOFF_STATE.md) — Mandatory continuity log for session transitions.
*   [**Production Status**](./project/PRODUCTION_STATUS.md) — Live environment health and known issues.
*   [**Changelog**](./project/CHANGELOG.md) — Version history and release notes.

---

## 🛠️ Technical Overview

### Core Stack
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4
- **Auth:** Auth.js (v5 beta) with Credentials Provider
- **Database:** Postgres + pgvector for RAG
- **AI:** OpenAI API for reasoning and embeddings

### Key Modules
- `src/lib/clients.ts`: Singleton Postgres/OpenAI clients + env validation.
- `src/lib/personaProvider.ts`: Persona loading + RAG context merge.
- `src/lib/rag.ts`: Hybrid search implementation (FTS + Vector).
- `src/lib/totp.ts`: TOTP generation and verification helpers.

### Data Model & RAG
The platform uses a Hybrid RAG system over the following data sources:
- **Personas:** Local metadata in `data/personas/`.
- **Knowledge:** Ingested from `data/personas/*/knowledge/` and `data/global-knowledge/`.
- **Context:** Industry and Challenge Level metadata in `data/industries/` and `data/challengelevels/`.

Run `npm run embed` after modifying any content in the `data/` directory.

---

## 🛡️ Security & Environment
Required environment variables for local development and production:
- `OPENAI_API_KEY`
- `AUTH_SECRET`
- `POSTGRES_URL` (or `POSTGRES_URL_LOCAL`)

For a full list of configuration options, see the [**Environment Guide**](./guides/ENVIRONMENT.md).
