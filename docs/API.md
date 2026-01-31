API Reference

Synthetic Persona Web exposes a set of HTTP endpoints used by the web client.
All endpoints return JSON unless noted otherwise.

Base URL examples
  • Local: http://localhost:3000
  • Vercel Preview/Prod: use the deployment URL shown by Vercel

Auth: None (MVP). LLM calls are protected via server‑side API keys.

Errors: Non‑2xx responses include { error: string, details?: any }.

—

POST /api/stress-test

Runs a persona “stress test” against a business idea and returns structured critique.

Request Body
{
  "personaType": "string",
  "challengeLevelId": "string",
  "idea": "string (10–1500 chars)",
  "goal": "string (5–300 chars)",
  "evaluationFocus": "string (5–300 chars)"
}

Response
{
  "persona": "string",
  "challengeLevel": 2,
  "challengeLevelId": "validation",
  "challengeLabel": "...",
  "challengeDetail": "...",
  "focus": "...",
  "personaReaction": "string",
  "triggeredRedFlags": ["string"],
  "summary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "improvements": ["string"],
  "questions": ["string"],
  "presentation": "string",
  "confidence": 75
}

Status Codes
  • 200 OK
  • 400 Bad request (validation)
  • 404 Persona not found
  • 500 Malformed model output

—

POST /api/idea-refinement

Asks missing‑info questions (if needed) and rewrites the pitch with improvements.

Request Body
{
  "personaType": "string",
  "challengeLevelId": "string (optional)",
  "idea": "string",
  "goal": "string",
  "stressResult": {
    "summary": "string (optional)",
    "gaps": ["string"],
    "improvements": ["string"],
    "questions": ["string"],
    "triggeredRedFlags": ["string"],
    "confidence": 70
  },
  "missingInfoQuestions": ["string"],
  "userAnswers": ["string"]
}

Response (needs more input)
{
  "status": "needs_input",
  "questions": ["string"]
}

Response (ok)
{
  "status": "ok",
  "refinedPitch": "string",
  "changesSummary": ["string"]
}

—

GET /api/copywriter

Returns the platform/format catalog and company guidelines used by the copywriter UI.

Response
{
  "platforms": [
    {
      "id": "string",
      "name": "string",
      "platform_purpose": "string",
      "core_voice": "string",
      "tone_adaptation": "string",
      "copy_guidelines_summary": "string",
      "global_guidelines": { "...": "..." },
      "formats": [
        {
          "id": "string",
          "platform_id": "string",
          "name": "string",
          "primary_goal_vibe": "string",
          "tone_preference": "string",
          "copy_guidelines": { "...": "..." }
        }
      ]
    }
  ],
  "companyGuidelines": { "...": "..." }
}

POST /api/copywriter

Generates copy outputs for selected platform/format pairs.

Request Body
{
  "personaType": "string",
  "context": "string (optional)",
  "message": "string",
  "goal": "string",
  "platforms": ["platform_id"],
  "formats": ["format_id"]
}

Response
{
  "persona": "string",
  "goal": "string",
  "message": "string",
  "context": "string",
  "outputs": [
    {
      "platformId": "string",
      "platformName": "string",
      "formatId": "string",
      "formatName": "string",
      "primaryCopy": "string",
      "alternateCopy": "string",
      "hashtags": ["string"],
      "cta": "string",
      "notes": ["string"]
    }
  ]
}

—

POST /api/berumen

Returns a dual response: a persona answer and a consultant analysis.

Request Body
{
  "personaType": "string",
  "businessType": "string",
  "city": "string",
  "question": "string"
}

Response
{
  "persona": "string",
  "industry": "string",
  "city": "string",
  "question": "string",
  "client": {
    "answer": "string",
    "tone": "string",
    "keyPoints": ["string"]
  },
  "consultant": {
    "analysis": "string",
    "recommendations": ["string"],
    "followUps": ["string"]
  },
  "confidence": 70
}

—

POST /api/scorecard

Computes an efficiency score and a short narrative using business inputs + benchmarks.

Request Body
{
  "personaType": "string",
  "businessType": "string",
  "city": "string",
  "patientsPerMonth": 10,
  "avgTicket": 10000,
  "mainChannel": "facebook",
  "adSpend": 4000,
  "returnRate": "3-4",
  "supportChannels": ["whatsapp", "google"]
}

Response
{
  "efficiencyScore": 5,
  "narratives": ["string"],
  "suggestedFocus": "optimize_spend"
}

—

POST /api/persona  (streaming)

Streams a persona’s answer to the last user message. This endpoint uses the AI SDK
streaming response and does not return a JSON envelope.

Request Body
{
  "personaType": "string",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

Response
  • Streaming text response (AI SDK stream)

—

GET /api/personas

Returns available personas for selectors.

Response
{
  "options": [
    { "id": "string", "name": "string", "role": "string" }
  ]
}

GET /api/personas/[id]/knowledge

Lists knowledge files available for a persona.

Response
{ "knowledgeFiles": ["string"] }

—

GET /api/industries

Returns industries for the selector.

Response
[
  { "id": "string", "name": "string" }
]

GET /api/cities

Returns cities for the selector.

Response
[
  { "id": "Monterrey", "name": "Monterrey" }
]

GET /api/challenge-levels

Returns challenge level options for the stress test.

Response
{
  "options": [
    { "id": "supportive", "name": "...", "detail": "...", "intensity": 1 }
  ]
}

—

POST /api/action-card (experimental)

Generates a compact action card. This endpoint expects a specific request shape and
is not currently wired in the UI.

Request Body (current schema)
{
  "personaType": "nutriologa" | "odontologa" | "psicologo" | "fisioterapeuta" | "estetica",
  "city": "string",
  "focus": "efficiency" | "conversion",
  "intake": { "...": "..." },
  "scorecard": {
    "efficiencyScore": 0,
    "conversionScore": 0,
    "objections": ["string"],
    "suggestions": ["string"]
  },
  "personaAnswer": {
    "reaction": "string",
    "objections": ["string"],
    "suggestions": ["string"],
    "conversionLikelihood": 0
  }
}

Response
{
  "diy": {
    "steps": ["string"],
    "scripts": [
      { "label": "string", "text": "string" }
    ]
  },
  "agency": ["string"],
  "why": "string",
  "impactScore": 0
}

—

Environment variables required (server)

- `OPENAI_API_KEY` — required for all AI calls (chat + embeddings)
- `POSTGRES_URL_LOCAL` — required for local dev (RAG + persona context)
- `POSTGRES_URL` — required for Vercel/production
- `OPENAI_MODEL` — optional override (defaults to `gpt-4o-mini`)

