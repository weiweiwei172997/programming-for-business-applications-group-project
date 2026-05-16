# Project Brief (Persistent)

## Product Vision

GymPath is a mobile-first fitness web app that reduces fitness decision fatigue. It gives beginners a safe and simple start, helps inconsistent users restart without guilt, and gives experienced gym users more useful split training, exercise substitutions, progress feedback, and advanced education.

The product should feel like a professional training companion, not a content dump.

## Core User Journey

1. User opens GymPath.
2. User enters profile data: height, weight, age, training level, experience, available days, available time, goal, and equipment access.
3. GymPath generates a plan:
   - beginners get full-body training
   - advanced users get split training
   - health-first users can get diet-only or home-bodyweight guidance
4. Before training, GymPath shows warm-up and activation guidance.
5. User views exercise teaching and nutrition guidance.
6. After training, user checks in and records fatigue, pain, workout duration, and perceived difficulty.
7. GymPath lightly adjusts later plans based on feedback.
8. User sees measurement and training trends.
9. User can post, comment, and like in a nickname-based community.
10. AI coach explains training, nutrition, and beginner misconceptions.

## Coding Conventions

- Use Python for MVP implementation.
- Keep core logic in `project.py`.
- Keep Streamlit UI in `app.py`.
- Keep deterministic calculations testable with pytest.
- Use clear function names such as `generate_workout_plan`, `assess_pain_response`, and `calculate_checkin_streak`.
- Prefer dictionaries with named keys for plan data.
- Use type hints for new core functions where reasonable.
- Keep comments short and useful.
- Do not hide business logic inside Streamlit button callbacks.

## Architecture Conventions

- UI layer: `app.py`
- Core logic: `project.py`
- AI service: `ai_coach.py`
- Storage helpers: `storage.py` if needed
- Static data: `data/*.json`
- Tests: `test_project.py`
- Source docs: `docs/`
- Agent docs: `agent_docs/`

## Quality Gates

- `python -m pytest` must pass after core logic changes.
- The app must launch with `streamlit run app.py`.
- The core flow must be manually tested after UI changes.
- AI failures must not break the app.
- Severe pain handling must remain cautious and non-diagnostic.
- Mobile layout must be checked before marking UI complete.

## Key Commands

```bash
python -m pip install -r requirements.txt
python -m pytest
streamlit run app.py
```

## Update Cadence

Update this brief when:

- the stack changes
- file structure changes
- a new major feature is added
- a feature is moved out of MVP
- commands or test strategy change

