@echo off
echo Starting Backend Server Only...
echo.

echo Setting up Node.js environment...
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Testing npm...
"C:\Program Files\nodejs\npm.cmd" --version

echo Starting Backend Server...
cd /d "%~dp0mamasafe\backend"
"C:\Program Files\nodejs\npm.cmd" start

echo.
echo Backend server is running on: http://localhost:5000
echo.
pause
