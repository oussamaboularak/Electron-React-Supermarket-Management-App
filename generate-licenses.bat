@echo off
chcp 65001 > nul
echo ===============================================
echo        🔑 مولد تراخيص Market Manager
echo ===============================================
echo.

:menu
echo اختر العملية المطلوبة:
echo.
echo 1. إنشاء ترخيص واحد
echo 2. إنشاء عدة تراخيص
echo 3. عرض جميع التراخيص
echo 4. إنشاء تراخيص تجريبية (5 تراخيص لمدة 7 أيام)
echo 5. إنشاء تراخيص شهرية (10 تراخيص لمدة 30 يوم)
echo 6. خروج
echo.
set /p choice="أدخل اختيارك (1-6): "

if "%choice%"=="1" goto single
if "%choice%"=="2" goto multiple
if "%choice%"=="3" goto list
if "%choice%"=="4" goto trial
if "%choice%"=="5" goto monthly
if "%choice%"=="6" goto exit
echo اختيار غير صحيح!
goto menu

:single
echo.
echo === إنشاء ترخيص واحد ===
set /p customer_name="اسم العميل (اختياري): "
set /p customer_email="بريد العميل (اختياري): "
set /p duration="مدة الترخيص بالأيام (افتراضي 30): "
if "%duration%"=="" set duration=30

node scripts/generate-license.js single "%customer_name%" "%customer_email%" %duration%
echo.
pause
goto menu

:multiple
echo.
echo === إنشاء عدة تراخيص ===
set /p count="عدد التراخيص: "
set /p duration="مدة كل ترخيص بالأيام (افتراضي 30): "
if "%duration%"=="" set duration=30

node scripts/generate-license.js generate %count% %duration%
echo.
pause
goto menu

:list
echo.
echo === عرض جميع التراخيص ===
node scripts/generate-license.js list
echo.
pause
goto menu

:trial
echo.
echo === إنشاء تراخيص تجريبية ===
echo جاري إنشاء 5 تراخيص تجريبية لمدة 7 أيام...
node scripts/generate-license.js generate 5 7
echo.
pause
goto menu

:monthly
echo.
echo === إنشاء تراخيص شهرية ===
echo جاري إنشاء 10 تراخيص شهرية لمدة 30 يوم...
node scripts/generate-license.js generate 10 30
echo.
pause
goto menu

:exit
echo.
echo شكراً لاستخدام مولد التراخيص!
echo تم حفظ جميع التراخيص في ملف licenses.json
pause
exit
