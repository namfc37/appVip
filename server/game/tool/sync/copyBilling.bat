@echo off

echo.
echo *** BILLING ***
set SRC_DIR=%SYNC_FROM_SERVER%\billing
set DES_DIR=%SYNC_TO%\php\private\billing

echo SRC_DIR: %SRC_DIR%
if not exist %SRC_DIR% (
	echo Not exist SRC_DIR
	goto ERROR
)
echo DES_DIR: %DES_DIR%
if not exist %SRC_DIR% (
	echo Not exist SRC_DIR
	goto ERROR
)

xcopy /s /q /y %SRC_DIR% %DES_DIR%
rmdir /s /q %DES_DIR%\%SYNC_CONFIG%>nul 2>nul

set SRC_DIR=%SRC_DIR%\%SYNC_CONFIG%\%SYNC_COUNTRY%\%SYNC_ENV%
if not exist %SRC_DIR% (
	echo Not exist %SRC_DIR%
	goto ERROR
)
xcopy /s /q /y %SRC_DIR% %DES_DIR%

if /I "%SYNC_ENV%"=="live" (
	set DIR_FAKE_PAYMENT=%DES_DIR%\test\fakePayment	
	IF exist %DIR_FAKE_PAYMENT% rmdir /s /q %DIR_FAKE_PAYMENT%>nul 2>nul
)