@echo off
echo.
echo *** COPY JAVA ***

set SERVICE_NAME=%1
set SERVICE_GROUP=%2
set SERVICE_EXTENSION=%3
echo SERVICE_NAME: %SERVICE_NAME%
echo SERVICE_GROUP: %SERVICE_GROUP%


set FROM_GAME=%SYNC_FROM_SERVER%\game
set TO_GAME=%SYNC_TO%\java\%SERVICE_NAME%_%SERVICE_GROUP%
rem rd /s /q %TO_GAME%
if not exist %TO_GAME% md %TO_GAME%

rem --- COPY CONF ---
set DES_DIR=%TO_GAME%\conf
if not exist %DES_DIR% md %DES_DIR%

set SRC_DIR=%FROM_GAME%\conf
xcopy /s /q /y %SRC_DIR% %DES_DIR% >nul

set SRC_DIR=%FROM_GAME%\configByMode\%SYNC_COUNTRY%\%SYNC_ENV%\conf
xcopy /s /q /y %SRC_DIR% %DES_DIR% >nul

%JAVA% -jar %JAR_NAME% %SRC_DIR%\cluster.properties %SERVICE_NAME% %SERVICE_GROUP% %SERVICE_EXTENSION%>nul 2>nul
move cluster.properties %DES_DIR%\cluster.properties >nul

rem --- COPY CONFIG ---
set DES_DIR=%TO_GAME%\config
if not exist %DES_DIR% md %DES_DIR%

set SRC_DIR=%FROM_GAME%\config
xcopy /s /q /y %SRC_DIR% %DES_DIR% >nul

set SRC_DIR=%FROM_GAME%\configByMode\%SYNC_COUNTRY%\%SYNC_ENV%\config
xcopy /s /q /y %SRC_DIR% %DES_DIR% >nul

%JAVA% -jar %JAR_NAME% %DES_DIR%\server.xml %SERVICE_NAME% %SERVICE_GROUP% %SERVICE_EXTENSION%>nul 2>nul
move server.xml %DES_DIR%\server.xml >nul

rem --- COPY SCRIPT ---
set SRC_DIR=%FROM_GAME%\tool\admin\script
set DES_DIR=%TO_GAME%

copy /y %SRC_DIR%\service.sh %DES_DIR%\service.sh >nul
%JAVA% -jar FixEndLine.jar LF %DES_DIR%\service.sh

copy /y %SRC_DIR%\jarName.sh %DES_DIR%\jarName.sh >nul
%JAVA% -jar FixEndLine.jar LF %DES_DIR%\jarName.sh

rem --- COPY JAR ---
set SRC_DIR=%FROM_GAME%\_release_
set DES_DIR=%TO_GAME%

copy /y %SRC_DIR%\kvtm.jar %DES_DIR%\ >nul

rem --- COPY DATA ---
set SRC_DIR=%FROM_GAME%\data
set DES_DIR=%TO_GAME%\data
if not exist %DES_DIR% md %DES_DIR%

xcopy /s /q /y %SRC_DIR% %DES_DIR% >nul

rem --- COPY LIB ---
set SRC_DIR=%FROM_GAME%\lib
set DES_DIR=%TO_GAME%\lib
if not exist %DES_DIR% md %DES_DIR%

xcopy /s /q /y %SRC_DIR% %DES_DIR% >nul