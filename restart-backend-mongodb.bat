@echo off
echo Restarting Backend with MongoDB Atlas Configuration...
echo.

echo Setting up Node.js environment...
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Stopping current backend server...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo Starting Backend Server with MongoDB Atlas...
cd /d "%~dp0mamasafe\backend"
start "Backend Server (MongoDB)" cmd /k "C:\Program Files\nodejs\node.exe" server.js

echo.
echo Backend server is starting with MongoDB Atlas connection...
echo MongoDB URI: mongodb+srv://ug2424887_db_user:***@cluster0.eijhook.mongodb.net
echo Backend: http://localhost:5000
echo.
echo Check the backend window for MongoDB connection status.
echo.
pause
