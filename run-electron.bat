@echo off
echo Starting Electron app...
echo Make sure React development server is running on http://localhost:3000
echo.
npx electron public/electron.js
pause
