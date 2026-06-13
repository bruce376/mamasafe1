@echo off
echo Starting MongoDB with local data directory...
mkdir C:\data\db 2>nul
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath C:\data\db --port 27017 --bind_ip 127.0.0.1
