@echo off
echo ===============================================
echo        Quick License Generator
echo ===============================================
echo.

if "%1"=="" (
    echo Usage: quick-generate.bat [count] [days]
    echo.
    echo Examples:
    echo   quick-generate.bat 1 30     - Generate 1 license for 30 days
    echo   quick-generate.bat 5 7      - Generate 5 trial licenses for 7 days
    echo   quick-generate.bat 10 365   - Generate 10 yearly licenses
    echo.
    echo Quick options:
    echo   quick-generate.bat trial    - 5 licenses for 7 days
    echo   quick-generate.bat monthly  - 10 licenses for 30 days
    echo   quick-generate.bat yearly   - 5 licenses for 365 days
    echo   quick-generate.bat list     - Show all licenses
    echo.
    pause
    exit /b 0
)

if "%1"=="trial" (
    echo Generating 5 trial licenses (7 days)...
    node scripts/generate-license.js generate 5 7
    goto end
)

if "%1"=="monthly" (
    echo Generating 10 monthly licenses (30 days)...
    node scripts/generate-license.js generate 10 30
    goto end
)

if "%1"=="yearly" (
    echo Generating 5 yearly licenses (365 days)...
    node scripts/generate-license.js generate 5 365
    goto end
)

if "%1"=="list" (
    echo Showing all licenses...
    node scripts/generate-license.js list
    goto end
)

set count=%1
set days=%2

if "%days%"=="" set days=30

echo Generating %count% licenses for %days% days...
node scripts/generate-license.js generate %count% %days%

:end
echo.
echo Done! Check licenses.json for all generated licenses.
pause
