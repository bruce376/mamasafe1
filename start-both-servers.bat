@echo off
echo ========================================
echo    Mamasafe Server Launcher
echo ========================================
echo.

echo Setting up Node.js environment...
set "PATH=%PATH%;C:\Program Files\nodejs"

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
echo.

echo Starting Backend Server...
cd /d "%~dp0mamasafe\backend"
start "Backend Server" /D "%~dp0mamasafe\backend" cmd /k "C:\Program Files\nodejs\npm.cmd start"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
cd /d "%~dp0mamasafe\frontend"
start "Frontend Server" /D "%~dp0mamasafe\frontend" cmd /k "C:\Program Files\nodejs\npm.cmd start"

echo.
echo ========================================
echo    Servers are starting!
echo    Backend: http://localhost:5000
echo    Frontend: http://localhost:3000
echo ========================================
echo.
echo Both servers should be running in separate windows.
echo Check those windows for any errors.
echo.
pause
