# CLAUDE.md - Claude Code Configuration for GymPath

## Project Context

**App:** GymPath  
**Stack:** Python core, FastAPI, React/Next, SQLite, pytest, TypeScript, DeepSeek/OpenAI-compatible AI API  
**Stage:** MVP development  
**User level:** Vibe-coder. The user relies on AI for most coding and tests the result.

## Directives

1. **Master Plan:** Always read `AGENTS.md` first.
2. **Memory:** Read `MEMORY.md` for current progress and decisions.
3. **Documentation:** Refer to `agent_docs/` for tech stack, code patterns, product requirements, and testing guides.
4. **Plan-First:** Propose a brief plan before multi-file changes unless the user clearly asks for direct implementation.
5. **Incremental Build:** Build one small feature at a time.
6. **Architecture:** Keep core logic in `project.py`, API routes in `api.py`, persistence in `storage.py`, and primary UI in `frontend/`.
7. **Verification:** Run `python -m pytest` after core logic changes; run `npm run typecheck` and `npm run build` after frontend changes.
8. **UI Quality:** GymPath must feel like a polished mobile-first fitness app.
9. **Safety:** Do not make medical diagnosis claims. Severe pain cases should tell users to stop and seek professional help.
10. **Communication:** Be concise and beginner-friendly. Ask one clarifying question if blocked.

## Commands

```bash
python -m pip install -r requirements.txt
python -m pytest
python -m py_compile project.py api.py storage.py test_project.py
cd frontend
npm install
npm run typecheck
npm run build
```

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_gympath.ps1
```

## What Not To Do

- Do not replace the FastAPI + React primary app with Streamlit.
- Do not hardcode API keys.
- Do not commit `.env`, SQLite databases, logs, releases, `.next`, or `node_modules`.
- Do not skip tests.
- Do not delete or overwrite files without confirmation.
