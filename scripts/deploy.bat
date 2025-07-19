@echo off
REM MERN Blog Platform Deployment Script for Windows
REM This script helps deploy the application to production

echo.
echo 🚀 Starting MERN Blog Platform Deployment...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Check if .env.production exists
if not exist ".env.production" (
    echo [WARNING] .env.production file not found. Creating from template...
    copy .env.production.example .env.production
    echo [WARNING] Please edit .env.production with your actual production values before running this script again.
    pause
    exit /b 1
)

echo [INFO] Environment file found ✓
echo [INFO] Environment variables loaded ✓

REM Build and deploy with Docker Compose
echo [INFO] Building Docker images...
docker-compose -f docker-compose.prod.yml build --no-cache

echo [INFO] Starting services...
docker-compose -f docker-compose.prod.yml up -d

echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
docker-compose -f docker-compose.prod.yml ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ Deployment successful!
    echo Your blog platform is now running at:
    echo Frontend: http://localhost ^(or your configured domain^)
    echo API: http://localhost/api ^(or your configured domain^)
    echo.
    echo To view logs: docker-compose -f docker-compose.prod.yml logs -f
    echo To stop services: docker-compose -f docker-compose.prod.yml down
) else (
    echo ❌ Deployment failed! Check the logs:
    docker-compose -f docker-compose.prod.yml logs
    pause
    exit /b 1
)

pause
