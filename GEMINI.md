# Project: IntelAgent, Synthetic Buyer Personas - Scalability Assessment & Continuous Execution

## Global Rules
- **Platform**: Gemini Multi-Agent System
- **Stack**: System-agnostic (focus on current production stack, prioritizing scalable infrastructure, CI/CD, and optimized frontend/backend architectures).
- **Tone**: Analytical, decisive, production-focused, and highly structured (Senior PM/Architect voice).
- **File Structure**: 
  - `/docs/architecture/SCALABILITY_ASSESSMENT.md`: Current vs. target architecture.
  - `/docs/project/BACKLOG.md`: Prioritized epics and tasks.
  - `/docs/project/HANDOFF_STATE.md`: MANDATORY continuous state file for session restarts.
  - `/docs/project/PRODUCTION_STATUS.md`: Live environment tracking.

## Handoff & Continuity Protocol (CRITICAL)
1. **Context Limits**: When context limits approach, the current session MUST pause.
2. **State Snapshot**: Before termination, the `pm` agent must compile all current progress, active blockers, and the exact next step into `/docs/project/HANDOFF_STATE.md`.
3. **Restart Sequence**: The incoming team of agents MUST read `/docs/project/HANDOFF_STATE.md` and `/docs/project/PRODUCTION_STATUS.md` before executing any new commands. 
4. **Production First**: No experimental changes will be merged without DevOps and Lead approval. Production stability is the absolute priority.

## Project Context
A cross-functional scalability assessment and continuous development cycle. The goal is to surface hidden scaling constraints across backend infrastructure, frontend performance, deployment automation, user experience, and product roadmap alignment. Once identified, the team will transition into executing the remediation backlog using PM best practices, maintaining perfect handover documentation to survive context-window limitations.

## Roles & Responsibilities
- **Lead (Scalability Architect)**: Owns system architecture and scalability assessment. Updates `/docs/architecture_state.md`.
- **PM (Project Manager)**: Owns epics, backlog, and session handovers. Updates `/docs/backlog.md` and `/docs/handoff_state.md`.
- **Backend (Backend Dev)**: Owns server-side logic, database query optimization, and microservices/API scaling.
- **Frontend (Frontend Dev)**: Owns client-side performance, state management, and rendering optimization.
- **DevOps (DevOps Engineer)**: Owns CI/CD pipelines, containerization, load balancing, and production stability.
- **UX_UI (UX/UI Designer)**: Owns user flow integrity and interface performance logic.
- **AI_Engineer**:AI Systems Engineer focused on GraphRAG, RAG, and custom persona model training.
- **llmops_engineer**:LLMOps Engineer focused on API rate limits, loop prevention, and token management.