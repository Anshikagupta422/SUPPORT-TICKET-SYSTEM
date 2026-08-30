Running both frontend and backend together
=======================================

1. From the project root (the folder containing `backend` and `frontend`) install root dev deps:

```powershell
cd SUPPORT-TICKET-SYSTEM-main
npm install
```

2. Install both subprojects (or run from root script):

```powershell
npm run install:all
```

3. Start both in development (opens backend + frontend processes in the same terminal):

```powershell
npm run dev
```

4. Production flow (build frontend and start backend to serve static files):

```powershell
npm run build
npm start
```

Notes
- `npm run dev` uses `concurrently` to run `npm --prefix backend run dev` and `npm --prefix frontend run dev` together.
- Ensure `node` and `npm` are installed and on PATH. Restart your terminal after installation.
