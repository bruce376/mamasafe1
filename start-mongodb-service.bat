@echo off
echo Starting MongoDB...
cd "C:\Program Files\MongoDB\Server\8.3\bin"
start /B mongod.exe --config mongod.cfg
