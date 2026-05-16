# Testing Strategy

## Test Framework

Use `pytest`.

Run all tests:

```bash
python -m pytest
```

For the React/Next frontend:

```bash
cd frontend
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Unit Tests

Unit tests should focus on deterministic functions in `project.py`.

Minimum test targets:

- `calculate_bmi`
- `recommend_training_split`
- `generate_workout_plan`
- `assess_pain_response`
- `adjust_plan_after_feedback`
- `calculate_checkin_streak`

## Recommended Test Cases

| Test | What It Checks |
|---|---|
| `test_calculate_bmi_valid_input` | BMI result is rounded and reasonable |
| `test_calculate_bmi_rejects_invalid_height` | Invalid height raises `ValueError` |
| `test_recommend_training_split_beginner` | Beginner gets full-body training |
| `test_recommend_training_split_advanced` | Experienced user gets split training |
| `test_generate_workout_plan_has_required_fields` | Plan includes schedule, warm-up, exercises, sets, reps, rest, notes |
| `test_assess_pain_response_stop_rule` | Severe or sharp pain returns stop recommendation |
| `test_assess_pain_response_modify_rule` | Moderate pain returns modify/replace recommendation |
| `test_adjust_plan_after_feedback_too_tired` | High fatigue reduces volume |
| `test_adjust_plan_after_feedback_too_long` | Long sessions trigger time-reduction advice |
| `test_calculate_checkin_streak` | Streak calculation works from date strings |

## Manual Checks

After UI work, manually test:

1. Run API with `python -m uvicorn api:app --reload --port 8000`.
2. Run frontend with `cd frontend && npm run dev`.
3. Open `http://localhost:3000`.
4. Enter profile data.
5. Generate a plan.
6. View warm-up and activation guidance.
7. View exercise teaching links.
8. Submit workout feedback.
9. Trigger pain-aware guidance.
10. Trigger plan adjustment.
11. Add measurements.
12. See progress trend.
13. Check the knowledge cards.

Fallback Streamlit check:

1. Open app with `streamlit run app.py`.
2. Confirm the Python-only prototype still loads.

## UI Verification

Check:

- mobile-sized screen readability
- no text overflow
- clear primary action on each screen
- no placeholder text
- consistent cards, spacing, and buttons
- professional, clean, athletic, data-driven feel
- primary React UI uses only black, white, and gray
- native controls are usable on mobile

## AI Verification

Check:

- API key is loaded from environment variables or Streamlit secrets.
- No API key is committed.
- API failure does not crash the app.
- AI coach refuses medical diagnosis framing.
- Severe pain advice remains cautious.

## Pre-Commit Hooks

No hooks are required yet. If hooks are added later, they should run:

```bash
python -m pytest
cd frontend && npm run typecheck
```

Optional future checks:

- `ruff check .`
- `ruff format .`

Do not add these tools unless they are added to `requirements.txt` and the user approves.

## Verification Loop

After each feature:

1. Run relevant unit tests.
2. Run the full pytest suite.
3. Run frontend typecheck/build if React UI changed.
4. Open React frontend if UI changed.
5. Fix failures immediately.
6. Update `MEMORY.md` when a milestone is complete.
