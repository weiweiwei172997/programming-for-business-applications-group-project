# GEMINI.md - Gemini CLI / Agent-First IDE Configuration for GymPath

## Project Context

**App:** GymPath  
**Stack:** Python, Streamlit, SQLite, pytest, pandas, python-dotenv, OpenAI-compatible AI API  
**Stage:** MVP development  
**User level:** Vibe-coder. The user relies heavily on AI coding.

## Directives

1. Read `AGENTS.md` first.
2. Read `MEMORY.md` for active state.
3. Use `agent_docs/` for detailed implementation guidance.
4. Propose a short plan before coding.
5. Implement one feature at a time.
6. Keep core logic in `project.py` and UI in `app.py`.
7. Run `python -m pytest` after changing core logic.
8. Do not hardcode API keys.
9. Do not make medical diagnosis claims.
10. Keep Streamlit UI mobile-first and professional.

## Commands

```bash
python -m pip install -r requirements.txt
python -m pytest
streamlit run app.py
```

## Start Prompt

Read `GEMINI.md`, `AGENTS.md`, and `MEMORY.md`, then implement Phase 1 of GymPath step by step.

