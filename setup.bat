@echo off
echo.
echo ==========================================
echo           DrVibe Setup Script
echo ==========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to https://nodejs.org/
    echo 2. Download and install the LTS version
    echo 3. Restart your command prompt
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

echo NPM version:
npm --version
echo.

:: Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo.
    echo Please create a .env file with your AWS credentials:
    echo 1. Copy .env.example to .env
    echo 2. Edit .env with your AWS credentials
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo           Setup Complete!
echo ==========================================
echo.
echo To start the application:
echo   npm start
echo.
echo Then open your browser to:
echo   http://localhost:3000
echo.
echo Press any key to start the server now...
pause >nul

npm start
