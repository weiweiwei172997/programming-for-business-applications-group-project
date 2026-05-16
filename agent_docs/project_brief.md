# Project Brief (Persistent)

## Product Vision

GymPath helps beginners, restarting users, advanced lifters, and health-first users stop guessing what to train and eat. It turns profile data, goals, training feedback, pain signals, and progress records into a clear training loop.

## Current MVP Shape

- Primary UI: React/Next black-white-gray training dashboard.
- Backend: FastAPI in `api.py`.
- Core logic: Python functions in `project.py`.
- Persistence: SQLite through `storage.py`.
- AI coach: DeepSeek/OpenAI-compatible API through environment variables with local fallback.
- Fallback: `app.py` Streamlit prototype remains available but is not the primary app.

## Core Conventions

- Keep course-required logic in `project.py`.
- Keep API route code thin; call `project.py` and `storage.py`.
- Keep database access in `storage.py`.
- Keep frontend API calls in `frontend/lib/api.ts`.
- Keep UI copy Chinese-first unless the user asks otherwise.
- Maintain the black/white/gray native-control visual direction.
- Do not commit `.env`, SQLite databases, logs, release zips, `.next`, or `node_modules`.

## Quality Gates

Run after relevant changes:

```bash
python -m pytest
python -m py_compile project.py api.py storage.py test_project.py
cd frontend
npm run typecheck
npm run build
```

## User-Facing Current Capabilities

1. Register/login or enter as guest.
2. Generate training plans by level and goal.
3. Use beginner four-day split, restarting plans, advanced plans, strength plans, muscle-gain plans, and health/home plans.
4. View warm-up guidance and teaching links.
5. Use nutrition plans and meal logging.
6. Select pain location on an anatomy image and receive substitutions/rehab suggestions.
7. Submit workout feedback and complete check-ins.
8. Save measurements for logged-in users and view trend lines.
9. Post, like, and comment in the community.
10. Ask AI coach fitness questions.

## Update Cadence

Update this brief when:

- The tech stack changes.
- A new persistent table or API family is added.
- The primary user flow changes.
- Run/deploy commands change.
- The assignment/report scope changes.
