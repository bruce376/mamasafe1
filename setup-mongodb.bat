@echo off
echo ========================================
echo    MongoDB Setup for Mamasafe
echo ========================================
echo.
echo Your backend is already configured for MongoDB!
echo Current status: Using in-memory database (development mode)
echo.
echo To use local MongoDB, you need to:
echo.
echo 1. Install MongoDB Community Server
echo    Download: https://www.mongodb.com/try/download/community
echo    - Select Windows platform
echo    - Choose Complete installation
echo    - Install as Windows Service
echo    - Data directory: C:\data\db
echo.
echo 2. After installation, MongoDB will run automatically
echo    on port 27017 (default)
echo.
echo 3. I will then configure your backend to use local MongoDB
echo.
echo ========================================
echo.
echo Press any key to continue with MongoDB installation guide...
pause

echo.
echo Opening MongoDB download page...
start https://www.mongodb.com/try/download/community

echo.
echo Please follow the installation steps above.
echo After installation, run this script again to configure the backend.
echo.
pause
