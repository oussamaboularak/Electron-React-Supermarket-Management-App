@echo off
echo ===============================================
echo        License Generator - Market Manager
echo ===============================================
echo.

:menu
echo Choose an option:
echo.
echo 1. Generate 1 license (30 days)
echo 2. Generate 5 licenses (30 days)
echo 3. Generate 10 licenses (30 days)
echo 4. Generate trial licenses (7 days)
echo 5. List all licenses
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto single
if "%choice%"=="2" goto five
if "%choice%"=="3" goto ten
if "%choice%"=="4" goto trial
if "%choice%"=="5" goto list
if "%choice%"=="6" goto exit
echo Invalid choice!
goto menu

:single
echo.
echo === Generating 1 license ===
node scripts/generate-license.js generate 1 30
echo.
pause
goto menu

:five
echo.
echo === Generating 5 licenses ===
node scripts/generate-license.js generate 5 30
echo.
pause
goto menu

:ten
echo.
echo === Generating 10 licenses ===
node scripts/generate-license.js generate 10 30
echo.
pause
goto menu

:trial
echo.
echo === Generating trial licenses ===
node scripts/generate-license.js generate 5 7
echo.
pause
goto menu

:list
echo.
echo === All licenses ===
node scripts/generate-license.js list
echo.
pause
goto menu

:exit
echo.
echo Thank you for using License Generator!
pause
exit
