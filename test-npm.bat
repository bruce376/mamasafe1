@echo off
echo Testing npm after PATH fix...
echo.

echo Adding Node.js to PATH for this session...
set PATH=%PATH%;C:\Program Files\nodejs

echo Testing npm command...
C:\Program Files\nodejs\npm.cmd --version

echo.
echo If npm version shows above, npm is working!
echo You can now close this window and use npm normally.
echo.
pause
