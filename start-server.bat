@echo off
echo Starting MamaCare Project Server...
cd /d "%~dp0"
python -m http.server 8080
pause
