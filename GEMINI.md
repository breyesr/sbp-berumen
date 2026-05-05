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


## Multi-Team Collaboration & Deployment Protocol
### 1. Branching Strategy
- **`main`**: **Production Source.** No direct AI commits or merges. This branch is managed by the Person in the Middle (Human) and only receives merges from `staging` after weekly validation and an **explicit request** from the Person in the Middle.
- **`staging`**: **Integration Hub.** The primary destination for all completed feature branches. Both teams merge verified work here to test cross-feature compatibility.
- **`feature/[team]/[task]`**: **Development Workspace.** Short-lived branches created from the latest `staging`.

### 2. Execution & Handoff Loop (Mandatory for AI Teams)
- **Branch Initiation**: Every NEW feature branch MUST be created from the latest state of `origin/staging` to ensure work begins on the most current integrated code.
- **Feature Isolation**: No work happens directly on `main` or `staging`. **Safety Check:** If you detect you are working on `main` or `staging`, notify the Person in the Middle immediately and STOP all coding.
- **Merge Gate**: To merge into `staging`, a Pull Request (PR) must be opened. AI teams must provide the Vercel Preview URL and confirm `npm run build` success.
- **Session Wrap-up (Critical)**: Before every commit/handoff, the team MUST:
    1. Update all relevant documentation (`BACKLOG.md`, `PRODUCTION_STATUS.md`).
    2. Finalize the `HANDOFF_STATE.md` with exact next steps, a summary of what was done, and key learnings.
    3. **Historical Logging**: Append a concise summary of the session (Timestamp, Team, Accomplishments, Learnings) to `/docs/project/HANDOFF_LOG.md`.
    4. Ensure the workspace is clean and ready for the next team.

### 3. Database & Secret Integrity
- **Local Isolation**: Teams MUST use local DB instances. No direct connection to Production DB from development branches.
- **Migrations & Schema Changes**: **STRICT HUMAN APPROVAL REQUIRED.** AI teams must obtain explicit permission from the Person in the Middle before modifying any database schema or running migration scripts.
- **Zero-Trust Secrets**: Never log or commit credentials. Use environment-specific variables managed via platform-native tools.

## Performance & Context Hygiene (Mandatory)
To maintain high response speeds and prevent context saturation, all agents must:
1. **Delegate Verbose Tasks**: Use subagents (`invoke_agent`) for multi-step investigations, batch edits, or large file reviews. This "compresses" session history into a single summary.
2. **Surgical Reads**: Never read files >500 lines in full if possible. Use `grep_search` to find line numbers and `read_file` with `start_line/end_line` for targeted analysis.
3. **Partition Documentation**: Keep `BACKLOG.md` and `HANDOFF_LOG.md` focused on active/recent items. Move completed/old items to `/docs/project/ARCHIVE_*.md`.
4. **Exclude Large Data**: Avoid searching or reading files in `reports/` or `node_modules/` unless explicitly requested.
5. **Skill Management**: Activate skills only when necessary for the current task. Prefer delegating to a subagent that activates the skill internally to keep the main chat history lean.

## Handoff & Continuity Protocol (CRITICAL)
1. **Context Limits**: When context limits approach, the current session MUST pause.
2. **State Snapshot**: Before termination, the `pm` agent must compile all current progress into `/docs/project/HANDOFF_STATE.md` and append to `/docs/project/HANDOFF_LOG.md`.
3. **Restart Sequence**: The incoming team MUST read `HANDOFF_STATE.md` and `PRODUCTION_STATUS.md` before execution. 
4. **Production First**: No experimental changes will be merged without DevOps and Lead approval. Production stability is the absolute priority.

## Project Context
A cross-functional scalability assessment and continuous development cycle. The goal is to surface hidden scaling constraints across backend infrastructure, frontend performance, deployment automation, user experience, and product roadmap alignment.

## Roles & Responsibilities
- **Lead (Scalability Architect)**: Owns system architecture and approves all PRs to `staging`.
- **PM (Project Manager)**: Owns backlog, assigns tasks to Team Alpha/Beta, and manages `staging` → `main` releases.
- **DevOps**: Owns environment mapping and CI/CD stability.
- **AI_Engineer**: AI Systems Engineer focused on GraphRAG, RAG, and custom persona model training.
- **LLMOps**: Focused on API rate limits, loop prevention, and token management.
- **AppSec_Engineer**: Threat modeling, SAST/DAST integration, and zero-trust security architecture.
- **Backend / Frontend / UX_UI**: Specialists executing tasks within designated feature branches.