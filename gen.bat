@echo off
echo Generating licenses...
node scripts/generate-license.js generate %1 %2
echo Done!
pause
