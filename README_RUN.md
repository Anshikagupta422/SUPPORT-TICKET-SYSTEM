Running the project locally (Windows)
===================================

Prerequisites
- Install Node.js (includes npm): https://nodejs.org/

Quick start (PowerShell)

1. Open PowerShell and navigate to the project folder that contains `backend` and `frontend` (the same folder as this README).
2. Run the helper script:

```powershell
.\
un-dev.ps1
```

Quick start (Batch)

```cmd
run-dev.bat
```

Manual commands

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Verify API health

```powershell
curl http://localhost:5000/api/health
```

Notes
- The backend will use `MONGO_URI` if provided; otherwise it falls back to an in-memory MongoDB for development.
- If you prefer running both services in one terminal, open two tabs/windows and run backend and frontend commands separately.
