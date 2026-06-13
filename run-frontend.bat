@echo off
echo Starting Frontend Server Only...
echo.

echo Setting up Node.js environment...
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Testing npm...
"C:\Program Files\nodejs\npm.cmd" --version

echo Starting Frontend Server...
cd /d "%~dp0mamasafe\frontend"
"C:\Program Files\nodejs\npm.cmd" start

echo.
echo Frontend server is running on: http://localhost:3000
echo.
pause
