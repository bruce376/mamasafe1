@echo off
echo Starting MongoDB manually...
cd /d "C:\Program Files\MongoDB\Server\8.3\bin"
mongod.exe --config mongod.cfg
echo MongoDB started. Press Ctrl+C to stop.
pause
