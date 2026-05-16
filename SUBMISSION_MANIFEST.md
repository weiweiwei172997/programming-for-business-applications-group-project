# GymPath Submission Manifest

This package contains the source code and original project data for the EBIS3033 group project.

## Included

- Python backend and core business logic:
  - `project.py`
  - `api.py`
  - `app.py`
  - `storage.py`
  - `test_project.py`
  - `requirements.txt`
- Next.js frontend source:
  - `frontend/app/`
  - `frontend/components/`
  - `frontend/lib/`
  - `frontend/public/`
  - `frontend/package.json`
  - `frontend/package-lock.json`
  - `frontend/tsconfig.json`
  - `frontend/next.config.mjs`
- Original project data:
  - `data/exercises.json`
  - `data/knowledge_cards.json`
  - `frontend/public/anatomy-muscles-zh.jpg`
- Project documentation:
  - `README.md`
  - `COLLABORATOR_SETUP.md`
  - `docs/`
  - AI prompt and agent documentation files.

## Excluded

The following were intentionally excluded because they are generated, local-only, or sensitive:

- `.env` and any real API keys.
- `frontend/node_modules/`
- `frontend/.next/`
- `__pycache__/`
- `.pytest_cache/`
- `.git/`
- `logs/`
- `tools/`
- `releases/`
- Runtime user database files such as `data/*.db`.
- Runtime upload folders such as `data/uploads/`.

Use `.env.example` as the template if an API key is needed for local testing.
