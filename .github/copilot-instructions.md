# GitHub Copilot Instructions for GymPath

## Project Context

**App:** GymPath  
**Stack:** Python, Streamlit, SQLite, pytest, pandas, python-dotenv, OpenAI-compatible AI API  
**Stage:** MVP development

## Directives

1. Read `AGENTS.md` for the current phase and tasks.
2. Refer to `agent_docs/` for tech stack details, code patterns, product requirements, and testing.
3. Follow the existing architecture:
   - core logic in `project.py`
   - Streamlit UI in `app.py`
   - tests in `test_project.py`
   - AI calls in `ai_coach.py`
   - SQLite helpers in `storage.py` if needed
4. Write or update tests for new deterministic logic.
5. Keep changes incremental and focused.
6. Do not hardcode API keys.
7. Do not make medical diagnosis claims.

## Commands

```bash
python -m pip install -r requirements.txt
python -m pytest
streamlit run app.py
```

