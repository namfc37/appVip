@echo off
call config.bat

cd %DIR_RELEASE%

set SCRIPT_VERSION=812

set APK_CODE=228
set APK_NAME=2.2.8

cd ..\..\..\..\..\..\
set PROJECT_DIR=%cd%
echo PROJECT_DIR: %PROJECT_DIR%
cd %DIR_RELEASE%

set CLIENT_FOLDER=%PROJECT_DIR%\client\build
set SERVER_FOLDER=%PROJECT_DIR%\server\game\configByMode

REM -------------------------- DEV --------------------------
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\brazil\dev\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\global\dev\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\myanmar\dev\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\philippine\dev\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\thailand\dev\version.json %SCRIPT_VERSION%

%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\brazil\dev\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\global\dev\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\myanmar\dev\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\philippine\dev\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\thailand\dev\version.json android %APK_CODE% %APK_NAME%

%JAVA% -jar %JAR_NAME% minClientCode %SERVER_FOLDER%\brazil\dev\conf\config.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% minClientCode %SERVER_FOLDER%\sea\dev\conf\config.json %SCRIPT_VERSION%


REM -------------------------- SANDBOX --------------------------
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\sandbox\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% minClientCode %SERVER_FOLDER%\vietnam\sandbox\conf\config.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\sandbox\version.json android %APK_CODE% %APK_NAME%


REM -------------------------- LIVE --------------------------
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\release\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\release\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% minClientCode %SERVER_FOLDER%\vietnam\live\conf\config.json %SCRIPT_VERSION%

%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\brazil\release\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\brazil\release\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% minClientCode %SERVER_FOLDER%\brazil\live\conf\config.json %SCRIPT_VERSION%


%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\global\release\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\myanmar\release\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\philippine\release\version.json %SCRIPT_VERSION%
%JAVA% -jar %JAR_NAME% clientVersion %CLIENT_FOLDER%\thailand\release\version.json %SCRIPT_VERSION%

%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\global\release\version.json android 11000%APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\myanmar\release\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\philippine\release\version.json android %APK_CODE% %APK_NAME%
%JAVA% -jar %JAR_NAME% apkVersion %CLIENT_FOLDER%\thailand\release\version.json android %APK_CODE% %APK_NAME%

%JAVA% -jar %JAR_NAME% minClientCode %SERVER_FOLDER%\sea\live\conf\config.json %SCRIPT_VERSION%


cd %PRJ_HOME%