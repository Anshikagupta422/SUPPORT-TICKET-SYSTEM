<#
run-dev.ps1
Installs dependencies and launches backend + frontend in separate PowerShell windows.
Place this script in the project root (the folder that contains `backend` and `frontend`).
#>
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

function Has-Command($name) {
    try {
        & $name --version > $null 2>&1
        return $true
    } catch {
        return $false
    }
}

if (-not (Has-Command node)) {
    Write-Host "Node.js (and npm) not found. Install from https://nodejs.org/ and re-run this script." -ForegroundColor Yellow
    exit 1
}

$env:ComSpec = "C:\Windows\system32\cmd.exe"
$env:COMSPEC = "C:\Windows\system32\cmd.exe"

Write-Host "Starting backend and frontend services..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command","$env:ComSpec = 'C:\Windows\system32\cmd.exe'; cd '$projectRoot\backend'; npm run dev" -WorkingDirectory "$projectRoot\backend"
Start-Process powershell -ArgumentList "-NoExit","-Command","$env:ComSpec = 'C:\Windows\system32\cmd.exe'; cd '$projectRoot\frontend'; npm run dev" -WorkingDirectory "$projectRoot\frontend"

Start-Process "http://localhost:5173"
Write-Host "Support Ticket System running at http://localhost:5173" -ForegroundColor Green
