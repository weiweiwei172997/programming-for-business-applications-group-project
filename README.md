# GymPath MVP

GymPath is a mobile-first Python fitness web app for an EBIS3033 Programming for Business Applications course project.

It helps users reduce fitness decision fatigue by generating a training plan, showing warm-up guidance, linking exercise teaching resources, giving nutrition targets, collecting workout feedback, making light plan adjustments, and showing progress trends.

## Current Interface Direction

The primary interface is now a React/Next black-white-gray training dashboard. The Python core remains in `project.py`, and `api.py` exposes that logic to the frontend with FastAPI.

The older Streamlit prototype in `app.py` is kept as a Python-only fallback.

## Features In This MVP Foundation

- User assessment
- Training level classification
- Adaptive plan generation
- Warm-up and activation guidance
- Exercise teaching links
- Protein and calorie guidance
- Pain-aware feedback guidance
- Light plan adjustment after workout feedback
- Progress measurement chart
- Account registration and login
- Community posts, likes, and comments
- Beginner fitness knowledge cards

## Tech Stack

- Python
- FastAPI
- React / Next
- SQLite local persistence for accounts and community data
- Streamlit fallback prototype
- pandas
- pytest
- python-dotenv
- OpenAI-compatible API client for future AI coach integration

## Project Structure

```text
group project/
  api.py
  app.py
  project.py
  test_project.py
  requirements.txt
  storage.py
  README.md
  frontend/
    app/
      globals.css
      layout.tsx
      page.tsx
    lib/
      api.ts
    package.json
  data/
    gympath_app.db
    exercises.json
    knowledge_cards.json
  docs/
    ai_prompt_log.md
    final_report_outline.md
    PRD-GymPath-MVP.md
    TechDesign-GymPath-MVP.md
    research-GymPath.md
```

## Setup

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

Run tests:

```bash
python -m pytest
```

Run the Python API:

```bash
python -m uvicorn api:app --reload --port 8000
```

Run the React/Next frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

On Windows, you can also start both the API and frontend together:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_gympath.ps1
```

The script now starts GymPath in LAN mode:

- API: `0.0.0.0:8000`
- Frontend: `0.0.0.0:3000`
- It prints a `LAN_APP_URL`, such as `http://你的电脑IP:3000`

Other people on the same Wi-Fi or campus network can open that `LAN_APP_URL`.
If they cannot access it, allow Python/Node.js through Windows Defender Firewall for private networks.
For internet access outside your network, use a tunnel tool such as Cloudflare Tunnel or ngrok and point it to port `3000`.

You can start a temporary public Cloudflare Tunnel with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_public_tunnel.ps1
```

The script prints a `PUBLIC_APP_URL`, such as:

```text
https://example.trycloudflare.com
```

Share that URL with testers. Keep this computer awake and keep the GymPath services running while others use it.

Community and account data are stored locally in:

```text
data/gympath_app.db
```

Run the Streamlit fallback prototype:

```bash
streamlit run app.py
```

## Course Requirement Notes

The required `project.py` file includes:

- `main()`
- multiple custom top-level functions
- testable business logic for workout plans, nutrition, pain guidance, plan adjustment, and streaks

The required `test_project.py` file contains pytest tests for the core functions.

## Safety Note

GymPath provides fitness education and planning support. It does not diagnose injuries or medical conditions. Severe, sharp, worsening, unusual, radiating pain, numbness, or loss of function should be treated as a stop signal and may require help from a qualified professional.
