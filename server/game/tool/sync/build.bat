@echo off
setlocal EnableDelayedExpansion
cls

if "%JAVA_HOME%"=="" (
    set JAVA_HOME=c:\Program Files\Java\jdk1.8.0_171
)
set JAVA="%JAVA_HOME%\bin\java"
set JAR_NAME=replaceConfig.jar

set SYNC_HOME=%cd%
cd ..\..\..\..\..
set PRJ_DIR=%cd%
cd %SYNC_HOME%

set SYNC_COUNTRY=%1
echo COUNTRY: %SYNC_COUNTRY%

set SYNC_ENV=%2
echo ENVIROMENT: %SYNC_ENV%
if not exist config%SYNC_COUNTRY%.bat (
	echo Invalid SYNC_COUNTRY
	goto ERROR
)
call config%SYNC_COUNTRY%.bat

set BRANCH=!BRANCH_%SYNC_ENV%!
echo BRANCH: %BRANCH%

set SYNC_FROM=!PATH_SVN_%SYNC_ENV%!
set SYNC_FROM_SERVER=%SYNC_FROM%\server
echo SYNC_FROM_SERVER: %SYNC_FROM_SERVER%
if not exist %SYNC_FROM_SERVER% (
	echo Invalid SYNC_FROM_SERVER
	goto ERROR
)

set SYNC_TO=%PATH_RELEASE_SERVER%\%SYNC_COUNTRY%\%SYNC_ENV%
echo SYNC_TO: %SYNC_TO%
if not exist %SYNC_TO% (
	echo Not exist SYNC_TO
	goto ERROR
)

set SYNC_CONFIG=_config

cd %SYNC_HOME%
call updateSVN.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

cd %SYNC_HOME%
call mergeFromTrunk.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

cd %SYNC_HOME%
call commitBranch.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

cd %SYNC_HOME%
call copyBilling.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

cd %SYNC_HOME%
call copyGM.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

cd %SYNC_HOME%
call makeJava.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

cd %SYNC_HOME%
call copyAllJava.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

cd %SYNC_HOME%
commitBuild.bat
IF %ERRORLEVEL% NEQ 0 goto ERROR

goto END
:ERROR
color 4E
echo *************** HAVE ERROR ***************
pause
color 07
EXIT /B 1

:END
setlocal DisableDelayedExpansion
echo.
