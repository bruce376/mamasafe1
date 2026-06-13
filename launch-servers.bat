@echo off
echo Starting Mamasafe Servers...
echo.

set "PATH=%PATH%;C:\Program Files\nodejs"

echo Starting Backend Server...
cd /d "%~dp0mamasafe\backend"
start "Backend" cmd /k "C:\Program Files\nodejs\node.exe" server.js

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd /d "%~dp0mamasafe\frontend"
start "Frontend" cmd /k "C:\Program Files\nodejs\node.exe" node_modules/http-server/bin/http-server -p 3000

echo.
echo Both servers should be running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
