@echo off
echo Starting MongoDB...
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%~dp0\mongodb-data" --port 27017
echo MongoDB exited with error code: %errorlevel%
pause
