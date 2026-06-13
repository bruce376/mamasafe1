@echo off
echo Installing Mamasafe Dependencies...
echo.

echo Setting up Node.js environment...
set PATH=%PATH%;C:\Program Files\nodejs

echo Installing Backend Dependencies...
cd /d "%~dp0mamasafe\backend"
C:\Program Files\nodejs\npm.cmd install
echo Backend dependencies installed successfully.
echo.

echo Installing Frontend Dependencies...
cd ../frontend
C:\Program Files\nodejs\npm.cmd install
echo Frontend dependencies installed successfully.
echo.

echo All dependencies installed!
echo You can now run 'npm start' to start both servers.
pause
