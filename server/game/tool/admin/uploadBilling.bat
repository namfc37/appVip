@echo off
call _config.bat

set REMOTE_HOME=
IF /I "%1"=="live" (
	set REMOTE_HOME=%LIVE_BILLING_HOME%
	set DEPLOY_HOME=%DEPLOY_HOME%\live\billing
)
IF /I "%1"=="sandbox" (
	set REMOTE_HOME=%SANDBOX_BILLING_HOME%
	set DEPLOY_HOME=%DEPLOY_HOME%\sandbox\billing
)
IF /I "%1"=="dev" (
	set REMOTE_HOME=%DEV_BILLING_HOME%
	set DEPLOY_HOME=%DEPLOY_HOME%\dev\billing
)
IF /I "%REMOTE_HOME%"=="" goto INVALID_PARAMS

cd %DEPLOY_HOME%
set DEPLOY_HOME=%CD%
echo REMOTE_HOME=%REMOTE_HOME%
echo DEPLOY_HOME=%DEPLOY_HOME%
cd %HOME_DIR%

set ENVIRONMENT=%1
set SERVICE=billing

setlocal EnableDelayedExpansion
set /a num=%random% %%4 +1
set verify=!ENVIRONMENT! !SERVICE:~0,%num%!
setlocal DisableDelayedExpansion
set /p ANSWER="Are you sure? Press "%verify%" to continue? "
IF /I NOT "%ANSWER%"=="%verify%" goto WRONG_VERIFY

set SCRIPT=tempScript
del %SCRIPT%>nul 2>nul

echo synchronize remote -delete -transfer=automatic -criteria=either -filemask="|.idea/" %DEPLOY_HOME% %REMOTE_HOME%>>%SCRIPT%

echo close>>%SCRIPT%
echo exit>>%SCRIPT%

for /F "delims=" %%s in (server\%ENVIRONMENT%\%SERVICE%.txt) do (
	echo Server: %%s
	echo open %%s>runScript
	type %SCRIPT% >>runScript
	WinSCP\winscp.com /script=runScript
	echo.
	echo.
)

del runScript>nul 2>nul
del %SCRIPT%>nul 2>nul

goto END
:WRONG_VERIFY
echo VERIFY PARAMS FAIL
goto ERROR

goto END
:INVALID_PARAMS
echo INVALID PARAMS
goto ERROR

goto END
:ERROR
color 4E
echo *************** HAVE ERROR ***************
pause
color 07
EXIT /B 1

:END