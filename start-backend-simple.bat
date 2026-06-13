@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
cd /d "%~dp0mamasafe\backend"
"C:\Program Files\nodejs\node.exe" server.js
