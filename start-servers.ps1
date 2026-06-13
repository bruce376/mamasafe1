# Mamasafe Server Startup Script
Write-Host "Starting Mamasafe Application..." -ForegroundColor Cyan

# Set up Node.js environment
$env:PATH += ";C:\Program Files\nodejs"

# Test npm
Write-Host "Testing npm..." -ForegroundColor Yellow
try {
    $npmVersion = & "C:\Program Files\nodejs\npm.cmd" --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm not working" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Blue
Set-Location (Join-Path $PSScriptRoot "mamasafe\backend")
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "server.js" -WindowStyle Hidden

Write-Host "Starting Frontend Server..." -ForegroundColor Blue
Start-Sleep -Seconds 2
Set-Location (Join-Path $PSScriptRoot "mamasafe\frontend")
Start-Process -FilePath "C:\Program Files\nodejs\npm.cmd" -ArgumentList "start" -WindowStyle Hidden

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servers started successfully!" -ForegroundColor Green
