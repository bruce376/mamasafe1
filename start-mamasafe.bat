@echo off
echo Starting Mamasafe Servers...
echo.

echo Setting up Node.js environment...
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Testing npm...
"C:\Program Files\nodejs\npm.cmd" --version

echo Starting Backend Server...
start cmd /k "cd /d ""%~dp0mamasafe\backend"" && C:\Program Files\nodejs\npm.cmd start"

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd /d ""%~dp0mamasafe\frontend"" && C:\Program Files\nodejs\npm.cmd start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
