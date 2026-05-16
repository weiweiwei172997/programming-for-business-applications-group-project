# GitHub Copilot Instructions for GymPath

## Project Context

**App:** GymPath  
**Stack:** Python core, FastAPI, React/Next, SQLite, pytest, TypeScript, DeepSeek/OpenAI-compatible AI API  
**Stage:** MVP development

## Directives

1. Read `AGENTS.md` for the current phase and tasks.
2. Refer to `agent_docs/` for tech stack details, code patterns, product requirements, and testing.
3. Follow the existing architecture:
   - core logic in `project.py`
   - API routes in `api.py`
   - persistence in `storage.py`
   - primary UI in `frontend/`
   - tests in `test_project.py`
4. Write or update tests for new deterministic logic.
5. Keep changes incremental and focused.
6. Do not hardcode API keys.
7. Do not make medical diagnosis claims.

## Commands

```bash
python -m pip install -r requirements.txt
python -m pytest
cd frontend
npm run typecheck
npm run build
```
