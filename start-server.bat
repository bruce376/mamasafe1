@echo off
title MamaCare Server
echo Starting MamaCare Server...
echo Server will run in this window
echo Close this window to stop the server
echo.
cd /d "%~dp0"
npm start
pause
