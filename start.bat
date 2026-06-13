@echo off
echo Starting Mamasafe Application in the current terminal...
echo.

echo Setting up Node.js environment...
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Starting Backend Server...
pushd mamasafe\backend >nul 2>&1
start /B "" "C:\Program Files\nodejs\npm.cmd" start
popd >nul 2>&1

echo Starting Frontend Server...
timeout /t 3 /nobreak > nul
pushd mamasafe\frontend >nul 2>&1
start /B "" "C:\Program Files\nodejs\npm.cmd" start
popd >nul 2>&1

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000 or the next free port printed above
echo.
