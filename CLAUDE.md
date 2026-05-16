# CLAUDE.md - Claude Code Configuration for GymPath

## Project Context

**App:** GymPath  
**Stack:** Python, Streamlit, SQLite, pytest, pandas, python-dotenv, OpenAI-compatible AI API  
**Stage:** MVP development  
**User level:** Vibe-coder. The user relies on AI for most coding and tests the result.

## Directives

1. **Master Plan:** Always read `AGENTS.md` first. It contains the current phase and tasks.
2. **Memory:** Read `MEMORY.md` to understand current progress.
3. **Documentation:** Refer to `agent_docs/` for tech stack, code patterns, product requirements, and testing guides.
4. **Plan-First:** Propose a brief plan and wait for approval before coding unless the user clearly asks for direct implementation.
5. **Incremental Build:** Build one small feature at a time.
6. **Verification:** Run `python -m pytest` after core logic changes. Run Streamlit manually after UI changes when possible.
7. **UI Quality:** Use the `frontend-design` standard when available. GymPath must feel like a polished mobile-first fitness app.
8. **Safety:** Do not make medical diagnosis claims. Severe pain cases should tell users to stop and seek professional help.
9. **Communication:** Be concise and beginner-friendly. Ask one clarifying question if blocked.

## Commands

```bash
python -m pip install -r requirements.txt
python -m pytest
streamlit run app.py
```

## What Not To Do

- Do not add React, Next.js, Django, or WeChat Mini Program code for the MVP.
- Do not hardcode API keys.
- Do not skip tests.
- Do not delete or overwrite files without confirmation.

