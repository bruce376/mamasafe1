@echo off
echo Downloading MongoDB installer...
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.3.2-signed.msi' -OutFile '%~dp0\mongodb-windows-x86_64-8.3.2-signed.msi'"

if exist "%~dp0\mongodb-windows-x86_64-8.3.2-signed.msi" (
    echo Download successful!
    echo Installing MongoDB...
    msiexec /i "%~dp0\mongodb-windows-x86_64-8.3.2-signed.msi" /passive /norestart ADDLOCAL=Server,Client,Router,MiscellaneousTools
    echo MongoDB installation complete!
) else (
    echo Download failed. Please download manually from: https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.3.2-signed.msi
)

pause
