@echo off
echo Running npm with full path...
echo.

cd %~dp0

echo Testing npm...
"C:\Program Files\nodejs\npm.cmd" --version

echo.
echo Starting both servers...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.

echo Starting Backend...
start "Backend" /min cmd /k "cd /d ""%~dp0mamasafe\backend"" && C:\Program Files\nodejs\npm.cmd start"

timeout /t 2 /nobreak > nul

echo Starting Frontend...
start "Frontend" /min cmd /k "cd /d ""%~dp0mamasafe\frontend"" && C:\Program Files\nodejs\npm.cmd start"

echo.
echo Both servers should be running now!
echo You can close this window.
pause
