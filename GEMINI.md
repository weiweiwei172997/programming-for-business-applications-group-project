# GEMINI.md - Gemini CLI / Agent-First IDE Configuration for GymPath

## Project Context

**App:** GymPath  
**Stack:** Python core, FastAPI, React/Next, SQLite, pytest, TypeScript, DeepSeek/OpenAI-compatible AI API  
**Stage:** MVP development  
**User level:** Vibe-coder. The user relies heavily on AI coding.

## Directives

1. Read `AGENTS.md` first.
2. Read `MEMORY.md` for active state.
3. Use `agent_docs/` for detailed implementation guidance.
4. Propose a short plan before multi-file coding.
5. Implement one feature at a time.
6. Keep core logic in `project.py`.
7. Keep API routes in `api.py`, persistence in `storage.py`, and primary UI in `frontend/`.
8. Run `python -m pytest` after changing core logic.
9. Run `npm run typecheck` and `npm run build` after frontend changes.
10. Do not hardcode API keys.
11. Do not make medical diagnosis claims.

## Commands

```bash
python -m pip install -r requirements.txt
python -m pytest
cd frontend
npm run typecheck
npm run build
```

## Start Prompt

Read `GEMINI.md`, `AGENTS.md`, and `MEMORY.md`, then continue GymPath step by step.
