# Tech Stack & Tools

GymPath is now a Python-core app with a FastAPI backend and React/Next frontend.

## Stack

| Layer | Tool | Notes |
|---|---|---|
| Core logic | Python | `project.py` contains course-required `main()` and testable functions |
| API | FastAPI + Pydantic | `api.py` exposes the Python logic to the frontend |
| Database | SQLite | `storage.py` creates `data/gympath_app.db` locally |
| Frontend | React / Next | `frontend/app/page.tsx` is the primary UI |
| Styling | CSS in `frontend/app/globals.css` | Black/white/gray, native controls, mobile-first |
| AI | OpenAI-compatible SDK | DeepSeek-compatible endpoint through environment variables |
| Tests | pytest + TypeScript compiler | Python logic tests and frontend type checks |
| Fallback prototype | Streamlit | `app.py` only; not the primary product UI |

## Dependencies

Python `requirements.txt`:

```text
streamlit
pytest
pandas
python-dotenv
openai
fastapi
uvicorn
```

Frontend `frontend/package.json`:

```text
next
react
react-dom
typescript
@types/node
@types/react
@types/react-dom
```

## Setup Commands

```bash
python -m pip install -r requirements.txt
cd frontend
npm install
cd ..
```

## Run Commands

Backend:

```bash
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm run dev:lan
```

One-command Windows LAN mode:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_gympath.ps1
```

Public tunnel:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_public_tunnel.ps1
```

## API Fetch Pattern

Use the helpers in `frontend/lib/api.ts`.

```ts
const result = await postJson<WorkoutPlan>("/api/plan", {
  level: profile.level,
  goal: profile.goal,
  minutes_per_session: profile.minutes_per_session,
});
```

For authenticated calls:

```ts
await putJson("/api/progress/measurements", { measurements }, authToken);
```

## Error Handling

Backend:

```python
try:
    return create_post(user["id"], request.title, request.content)
except ValueError as error:
    raise HTTPException(status_code=400, detail=str(error)) from error
```

Frontend:

```ts
try {
  await postJson("/api/community/posts", postDraft, authToken);
} catch (error) {
  setCommunityError(error instanceof Error ? error.message : "操作失败");
}
```

## Naming Conventions

- Python functions: `snake_case`
- Python API request models: `PascalCase`
- TypeScript types: `PascalCase`
- React state setters: `setX`
- API paths: `/api/kebab-or-resource-style`
- Database tables: plural lowercase names such as `users`, `measurements`, `checkins`

## Persistence Rules

- Use SQLite for MVP persistence.
- Logged-in user data must use `storage.py` functions and authenticated API routes.
- Guest data can stay in React state.
- Do not commit `data/*.db`.
