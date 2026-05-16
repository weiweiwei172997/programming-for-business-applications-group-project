# Testing Strategy

## Automated Checks

Python core tests:

```bash
python -m pytest
```

Python syntax check:

```bash
python -m py_compile project.py api.py storage.py test_project.py
```

Frontend type check:

```bash
cd frontend
npm run typecheck
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Current Test Focus

`test_project.py` should cover deterministic Python logic in `project.py`, including:

- BMI and nutrition calculation
- training split recommendation
- workout plan generation
- pain response stop/modify/continue logic
- plan adjustment after fatigue/pain/time feedback
- check-in streak and reward logic
- progress trend summary

## Manual End-to-End Checks

Run after meaningful UI/API/storage changes:

1. Start GymPath with `scripts/start_gympath.ps1`.
2. Open `http://localhost:3000`.
3. Register a new account.
4. Generate a plan.
5. Submit workout feedback and confirm check-in updates.
6. Save measurement records, refresh, log back in, and confirm records persist.
7. Create a post, like it, and comment.
8. Ask the AI coach a fitness question.
9. Test guest preview still opens the app.
10. Test phone-width layout.

## Persistence Checks

For logged-in users:

- Community actions should save in SQLite.
- Check-ins should save in SQLite.
- Measurements should save in SQLite.
- Workout feedback should save in SQLite.

For guest mode:

- Data can remain in page state.
- Community write actions should require login.

## Pre-Commit Expectations

Before committing:

```bash
python -m pytest
cd frontend
npm run typecheck
npm run build
```

If any check fails, fix it before continuing or explicitly report the failure.
