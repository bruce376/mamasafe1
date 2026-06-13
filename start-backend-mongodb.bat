@echo off
echo Starting Backend with MongoDB Atlas...
echo.

set "PATH=%PATH%;C:\Program Files\nodejs"

cd /d "%~dp0mamasafe\backend"
start "Backend (MongoDB)" cmd /k "C:\Program Files\nodejs\node.exe" server.js"

echo Backend server is starting with MongoDB Atlas connection...
echo Backend: http://localhost:5000
echo.
pause
