# AGENTS.md — GymPath AI Build Instructions

## Project Snapshot

**Product:** GymPath  
**Purpose:** Help users reduce fitness decision fatigue with training plans, warm-ups, exercise teaching links, nutrition guidance, pain-aware substitutions, progress tracking, community, and AI coaching.  
**Stage:** MVP for EBIS3033 Programming for Business Applications  
**User level:** Vibe-coder / beginner relying heavily on AI  
**Primary stack:** Python core, FastAPI, React/Next, SQLite, pytest, TypeScript, OpenAI-compatible DeepSeek API  
**Fallback prototype:** `app.py` Streamlit demo only; do not treat Streamlit as the primary UI.

## How I Should Think

1. **Understand intent first:** identify what the user actually wants before editing.
2. **Ask if critical information is missing:** one concise question only when necessary.
3. **Plan before coding:** for multi-file changes, outline the approach before implementation.
4. **Implement incrementally:** one feature slice at a time.
5. **Verify after changes:** run Python tests, TypeScript checks, builds, or manual UI checks as appropriate.
6. **Explain trade-offs:** especially around local hosting, SQLite, AI API cost, and safety.

## Current Product Requirements

MVP must support:

1. Local registration/login with username/password.
2. Guest preview mode for browsing.
3. Training profile with level, goal, plan type, body data, activity level, and session time.
4. Beginner four-day split, restarting plans, advanced splits, health/home plans, strength plans, and muscle-gain plan variants.
5. Warm-up and activation guidance before each workout.
6. Exercise cards with Bilibili/Douyin teaching links where available.
7. Nutrition targets, fat-loss plans, muscle-gain/strength nutrition rules, and meal logging.
8. Pain-aware anatomy map, joint selection, replacement actions, rehab suggestions, and video links.
9. Workout feedback, check-in reward loop, and seven-day supplement lottery mechanism.
10. Saved measurements with weight, waist, and body-fat trend lines.
11. Community posts, likes, and comments.
12. AI coach Q&A with DeepSeek-compatible API and local fallback.

## Architecture Rules

- Keep deterministic business logic in `project.py`.
- Keep API routing and request validation in `api.py`.
- Keep persistence in `storage.py`.
- Keep primary UI in `frontend/app/page.tsx` and shared fetch helpers in `frontend/lib/api.ts`.
- Keep `test_project.py` focused on Python core logic.
- Do not move course-required functions out of `project.py`.
- Do not put important business logic only inside React event handlers.
- Do not use `.env` values in committed docs or code.

## File Map

```text
group project/
  project.py                  # Python core and course-required main()
  api.py                      # FastAPI wrapper around Python logic
  storage.py                  # SQLite accounts, sessions, community, check-ins, measurements, feedback
  test_project.py             # pytest coverage for deterministic functions
  requirements.txt
  app.py                      # Streamlit fallback only
  frontend/
    app/page.tsx              # Primary React/Next UI
    app/globals.css
    lib/api.ts
    next.config.mjs           # /api proxy to FastAPI
    package.json
  scripts/
    start_gympath.ps1
    start_public_tunnel.ps1
  docs/
    PRD-GymPath-MVP.md
    TechDesign-GymPath-MVP.md
    research-GymPath.md
```

## Commands

Python:

```bash
python -m pip install -r requirements.txt
python -m pytest
python -m py_compile project.py api.py storage.py test_project.py
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run typecheck
npm run build
npm run dev:lan
```

Full local/LAN start:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_gympath.ps1
```

Temporary public tunnel:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_public_tunnel.ps1
```

## Environment Variables

Use `.env` locally and never commit it.

```text
DEEPSEEK_API_KEY=your_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_MAX_TOKENS=1200
DEEPSEEK_REASONING_EFFORT=medium
GYMPATH_DB_PATH=optional_custom_sqlite_path
```

## Persistence Rules

- SQLite database is created at `data/gympath_app.db`.
- Logged-in users should get persistent account, community, check-in, feedback, and measurement data.
- Guest mode may use local page state only.
- Any new user-owned feature should include a storage function, API route, and frontend integration.

## AI Coach Rules

- Send only necessary fitness context: level, goal, current plan summary, latest feedback, latest pain check, and recent progress entries.
- Never send passwords, raw session tokens, or API keys.
- AI answers are fitness education, not medical diagnosis.
- Severe, sharp, worsening, radiating pain, numbness, or loss of function should trigger stop-and-seek-professional-help language.
- If the API fails, preserve local fallback guidance.

## UI Rules

- Primary UI uses React/Next, native HTML controls, and black/white/gray styling.
- Keep mobile-first behavior working.
- Avoid placeholder text, generic AI copy, and unpolished default layouts.
- Do not reintroduce colored palettes unless the user explicitly asks.
- Exercise cards should focus on exercise name, sets/reps/rest, teaching link, and useful plan context.

## What NOT To Do

- Do NOT delete files without explicit confirmation.
- Do NOT commit `.env`, SQLite databases, logs, releases, or `node_modules`.
- Do NOT hardcode API keys.
- Do NOT add payment, VIP, or medical diagnosis claims in the MVP.
- Do NOT replace the FastAPI + React primary app with Streamlit.
- Do NOT skip tests or type checks after code changes.
- Do NOT bypass failing checks without telling the user.

## Current Phase

Phase 1 is now beyond the initial prototype. The priority is:

1. Keep docs aligned with the real FastAPI + React architecture.
2. Make logged-in user data persistent.
3. Keep AI coach context-aware and safe.
4. Preserve course requirements in `project.py`, `test_project.py`, `requirements.txt`, README, report, and prompt log.

## Definition of Done

A change is done when:

- The feature works for the intended user flow.
- Python core logic remains testable.
- `python -m pytest` passes for core changes.
- `npm run typecheck` and `npm run build` pass for frontend changes.
- README or docs are updated if commands, architecture, or user-visible behavior changed.
