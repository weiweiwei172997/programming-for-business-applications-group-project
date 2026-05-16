# GymPath Submission Manifest

This package contains the source code, project documents, original/local project data, and runtime configuration used for the EBIS3033 group project.

Prepared for final teacher submission on 2026-05-17.

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
  - `data/gympath_app.db`
  - `data/uploads/`
  - `frontend/public/anatomy-muscles-zh.jpg`
- Runtime/configuration files:
  - `.env` with the configured DeepSeek API settings, included because the submitter explicitly requested a complete package.
  - `.env.example`
- Repository and workflow files:
  - `.git/`
  - `.github/`
  - `.cursor/`
  - `.cursorrules`
- Project documentation:
  - `README.md`
  - `COLLABORATOR_SETUP.md`
  - `docs/`
  - AI prompt and agent documentation files.
- Local helper tools and release artifacts:
  - `tools/`
  - `releases/`
  - `scripts/`
  - `logs/`

## Excluded

The following are intentionally excluded because they are generated dependency/cache/build artifacts and are not original project code or original project data:

- `frontend/node_modules/`
- `frontend/.next/`
- `__pycache__/`
- `.pytest_cache/`
- `frontend/tsconfig.tsbuildinfo`

To run the project after extraction, install dependencies again with `pip install -r requirements.txt` and `npm install` inside `frontend/`.

Security note: this package intentionally includes sensitive runtime configuration because the submitter requested a complete handoff. Rotate API keys after submission if needed.
