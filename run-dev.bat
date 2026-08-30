@echo off
REM run-dev.bat - helper to launch backend and frontend in separate PowerShell windows
SET scriptDir=%~dp0

echo Checking for Node.js...
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo Node.js not found. Install from https://nodejs.org/ and re-run this script.
  pause
set COMSPEC=C:\Windows\system32\cmd.exe
set ComSpec=C:\Windows\system32\cmd.exe

start powershell -NoExit -Command "$env:ComSpec = 'C:\Windows\system32\cmd.exe'; cd '%scriptDir%backend'; npm run dev"
start powershell -NoExit -Command "$env:ComSpec = 'C:\Windows\system32\cmd.exe'; cd '%scriptDir%frontend'; npm run dev"
start http://localhost:5173
