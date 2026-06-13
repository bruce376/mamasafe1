@echo off
echo Starting MongoDB with debug output...
cd /d "C:\Program Files\MongoDB\Server\8.3\bin"
mongod.exe --dbpath "C:\data\db" --port 27017 --bind_ip 127.0.0.1 --logpath "C:\data\mongod-debug.log" --logappend
pause
