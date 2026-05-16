# Code Patterns

## Python Core Pattern

Business logic belongs in `project.py` so it can be tested with pytest and reused by API/UI layers.

```python
def adjust_plan_after_feedback(plan: dict, feedback: dict) -> dict:
    """Return a light next-session adjustment from deterministic feedback."""
    # Keep this deterministic and testable.
```

## FastAPI Route Pattern

Routes should validate input, call `project.py` or `storage.py`, and return JSON.

```python
@app.post("/api/feedback")
def feedback(request: FeedbackRequest, user: dict[str, Any] | None = Depends(optional_user)) -> dict[str, Any]:
    payload = {
        "completed": request.completed,
        "fatigue_level": request.fatigue_level,
        "duration_min": request.duration_min,
        "pain_level": request.pain_level,
    }
    adjustment = adjust_plan_after_feedback(request.plan, payload)
    if user:
        adjustment["saved_feedback"] = create_workout_feedback(user["id"], payload, adjustment)
    return adjustment
```

## Storage Pattern

Database code belongs in `storage.py`. Use parameterized SQL only.

```python
def list_checkins(user_id: int) -> list[str]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT checkin_date FROM checkins WHERE user_id = ? ORDER BY checkin_date ASC",
            (user_id,),
        ).fetchall()
    return [row["checkin_date"] for row in rows]
```

## Frontend API Pattern

Use `frontend/lib/api.ts` helpers instead of raw fetch calls scattered through components.

```ts
const result = await postJson<FeedbackResult>("/api/feedback", { plan, ...feedback }, authToken);
```

## Auth Pattern

- Store the session token in `localStorage` on the client.
- Send it as `Authorization: Bearer <token>`.
- Backend stores only the token hash.
- Guest mode may browse but cannot write community data.

## Persistence Pattern

When a feature should survive refresh/login:

1. Add or reuse a SQLite table in `storage.py`.
2. Add storage functions.
3. Add an authenticated API route.
4. Call that route from the frontend when `authToken` exists.
5. Keep a guest-mode fallback in local state.

## UI Pattern

- Use native controls.
- Keep text Chinese-first.
- Keep black/white/gray visual style.
- Keep mobile layout readable.
- Avoid generic exercise cue copy on every card.

## Error Handling Pattern

Backend:

```python
except ValueError as error:
    raise HTTPException(status_code=400, detail=str(error)) from error
```

Frontend:

```ts
catch (error) {
  setStatus(error instanceof Error ? `保存失败：${error.message}` : "保存失败");
}
```
