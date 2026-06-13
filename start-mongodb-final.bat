@echo off
echo ========================================
echo MongoDB Startup Script
echo ========================================
echo.
echo This script will start MongoDB manually
echo MongoDB will run in this window
echo Press Ctrl+C to stop MongoDB
echo.
echo Creating data directory if needed...
if not exist "C:\data\db" mkdir "C:\data\db"
echo.
echo Starting MongoDB on port 27017...
echo.
cd /d "C:\Program Files\MongoDB\Server\8.3\bin"
mongod.exe --dbpath "C:\data\db" --port 27017 --bind_ip 127.0.0.1
