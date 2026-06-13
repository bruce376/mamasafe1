@echo off
echo ========================================
echo    Mamasafe Server Launcher
echo ========================================
echo.

echo Setting up environment...
set PATH=%PATH%;C:\Program Files\nodejs

echo Testing npm...
"C:\Program Files\nodejs\npm.cmd" --version
if %errorlevel% neq 0 (
    echo ERROR: npm not working
    pause
    exit /b 1
)

echo.
echo SUCCESS: npm is working!
echo.
echo Starting servers...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.

echo Starting Backend Server...
start "Backend Server" /min cmd /k "cd /d ""%~dp0mamasafe\backend"" && C:\Program Files\nodejs\npm.cmd start"

echo Waiting 2 seconds...
timeout /t 2 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" /min cmd /k "cd /d ""%~dp0mamasafe\frontend"" && C:\Program Files\nodejs\npm.cmd start"

echo.
echo ========================================
echo    Servers are starting!
echo    Close this window when ready
echo ========================================
echo.
pause
