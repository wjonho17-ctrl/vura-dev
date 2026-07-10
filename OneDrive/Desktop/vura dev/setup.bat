@echo off
REM Vura Ecosystem - Windows Setup Script
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo   Vura Ecosystem - Complete Setup
echo ============================================================
echo.

REM Check prerequisites
echo [1/6] Checking prerequisites...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker is not installed!
    echo Install from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo [OK] Docker is installed
echo.

REM Start Docker services
echo [2/6] Starting Docker services...

docker-compose down 2>nul
docker-compose up -d

timeout /t 10 /nobreak

echo [OK] Docker services started
echo.

REM Install dependencies
echo [3/6] Installing dependencies...

cd vura-backoffice-develop
echo   Installing Backoffice dependencies...
call npm install --silent
cd ..

cd vura-hms-main
echo   Installing HMS dependencies...
call npm install --silent
cd ..

if exist vura-pms-main (
    cd vura-pms-main
    echo   Installing PMS dependencies...
    call npm install --silent
    cd ..
)

cd mock-ebm-api
echo   Installing Mock EBM API dependencies...
call npm install --silent
cd ..

echo [OK] Dependencies installed
echo.

REM Generate APP_KEYs
echo [4/6] Generating application keys...

for /d %%D in (vura-*) do (
    if exist "%%D\.env" (
        for /f "delims=" %%K in ('node -e "console.log(Buffer.from(require('crypto').randomBytes(32)).toString('base64'))"') do (
            set KEY=%%K
        )
        setlocal enabledelayedexpansion
        powershell -Command "(Get-Content '%%D\.env') -replace 'APP_KEY=', 'APP_KEY=!KEY!' | Set-Content '%%D\.env'"
        endlocal
        echo [OK] %%D APP_KEY generated
    )
)

echo.

REM Run migrations
echo [5/6] Running database migrations...

cd vura-backoffice-develop
echo   Migrating Backoffice database...
call node ace migration:run --silent 2>nul
cd ..

cd vura-hms-main
echo   Migrating HMS database...
call node ace migration:run --silent 2>nul
cd ..

echo [OK] Migrations completed
echo.

REM Summary
echo ============================================================
echo                   Setup Completed!
echo ============================================================
echo.

echo Services Running:
echo   PostgreSQL:      localhost:5432
echo   Redis:           localhost:6379
echo   Meilisearch:     localhost:7700
echo   Mailpit:         localhost:8025 (http://localhost:8025)
echo   LocalStack S3:   localhost:4566
echo   Mock EBM API:    localhost:3500
echo.

echo Next Steps:
echo   1. Open VSCode and go to Run ^> Debug (or press Ctrl+Shift+D^)
echo   2. Select a configuration:
echo      - 'Vura Backoffice Dev' (port 3334^)
echo      - 'Vura HMS Dev' (port 3335^)
echo      - 'Vura PMS Dev' (port 3333^)
echo      - 'Mock EBM API' (port 3500^)
echo      - 'All Services' (run all together^)
echo   3. Press F5 to start
echo.

echo Or run manually from PowerShell:
echo   cd vura-backoffice-develop; npm run dev
echo   cd vura-hms-main; npm run dev
echo   cd mock-ebm-api; npm start
echo.

echo Check SETUP.md for detailed documentation.
echo.

pause
