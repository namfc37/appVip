@echo off

echo.
echo *** GM ***
set SRC_DIR=%SYNC_FROM_SERVER%\gm
set DES_DIR=%SYNC_TO%\php\private\gm

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