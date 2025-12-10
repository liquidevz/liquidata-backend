@echo off
REM Backend Deployment Script for Windows
setlocal enabledelayedexpansion

REM Default environment
set ENVIRONMENT=%1
set USE_PM2=%2
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
if "%USE_PM2%"=="" set USE_PM2=false

echo 🚀 Starting backend deployment for %ENVIRONMENT% environment

REM Validate environment
if not "%ENVIRONMENT%"=="local" if not "%ENVIRONMENT%"=="staging" if not "%ENVIRONMENT%"=="production" (
    echo ❌ Invalid environment. Use: local, staging, or production
    exit /b 1
)

REM Check if environment file exists
if not exist ".env.%ENVIRONMENT%" (
    echo ❌ Environment file .env.%ENVIRONMENT% not found
    exit /b 1
)

echo 📋 Using environment: %ENVIRONMENT%

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci --only=production
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist "logs" mkdir logs
if not exist "public\uploads\blogs" mkdir public\uploads\blogs
if not exist "public\uploads\case-studies" mkdir public\uploads\case-studies
if not exist "public\uploads\logos" mkdir public\uploads\logos

REM Start the application
if "%USE_PM2%"=="true" (
    echo 🚀 Starting with PM2...
    if "%ENVIRONMENT%"=="local" (
        call npm run dev
    ) else (
        call npm run pm2:start:%ENVIRONMENT%
    )
) else (
    echo 🚀 Starting application directly...
    call npm run start:%ENVIRONMENT%
)

if errorlevel 1 (
    echo ❌ Failed to start application
    exit /b 1
)

echo ✅ Backend deployment completed successfully!