# GymPath Collaborator Setup

This package contains the GymPath Python + FastAPI + Next.js web app.

## 1. Install Required Software

- Python 3.12 or newer
- Node.js 20 or newer
- Git, if you want to contribute through GitHub

## 2. Install Dependencies

From the project root:

```powershell
python -m pip install -r requirements.txt
cd frontend
npm install
cd ..
```

## 3. Configure Environment

Copy `.env.example` to `.env`.

```powershell
Copy-Item .env.example .env
```

Optional: add your own DeepSeek key in `.env` if you want the AI coach to use the real API.
Without a key, the app still runs with local fallback answers.

## 4. Run The App

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_gympath.ps1
```

Open:

```text
http://localhost:3000
```

The script also prints a LAN URL such as:

```text
http://your-computer-ip:3000
```

People on the same network may be able to open that URL. If not, use the public tunnel.

## 5. Optional Public Tunnel

After the app is running:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_public_tunnel.ps1
```

Share the printed `PUBLIC_APP_URL`.

## 6. Run Checks

```powershell
python -m pytest
cd frontend
npm run build
```

## Notes

- Do not commit `.env`.
- Local account and community data are stored in `data/gympath_app.db`.
- The database is intentionally excluded from Git and release packages.
