@echo off
echo Starting Mamasafe with npm...
echo.

echo Setting up npm for this session...
set PATH=%PATH%;C:\Program Files\nodejs

echo Testing npm...
C:\Program Files\nodejs\npm.cmd --version

echo.
echo Starting both servers...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.

echo Starting Backend Server...
start "Backend Server" /min cmd /k "cd /d ""%~dp0mamasafe\backend"" && C:\Program Files\nodejs\npm.cmd start"

timeout /t 2 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" /min cmd /k "cd /d ""%~dp0mamasafe\frontend"" && C:\Program Files\nodejs\npm.cmd start"

echo.
echo Both servers are starting in separate windows...
echo You can close this window after servers start.
echo.
pause
