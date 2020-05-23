@echo off

set ENVIRONMENT=%1
set SERVICE=%2

echo ENVIRONMENT: %ENVIRONMENT%
echo SERVICE: %SERVICE%

set CONFIG_BAT=config%ENVIRONMENT%.bat
if not exist %CONFIG_BAT% (
	echo NOT EXIST FILE %CONFIG_BAT%
	goto ERROR
)
call %CONFIG_BAT%

set DEPLOY_HOME=%DEPLOY_HOME%\%ENVIRONMENT%\php\private\%SERVICE%
if not exist %DEPLOY_HOME% (
	echo DEPLOY_HOME: %DEPLOY_HOME%
	echo NOT EXIST FOLDER DEPLOY_HOME
	goto ERROR
)
cd %DEPLOY_HOME%
set DEPLOY_HOME=%CD%
echo DEPLOY_HOME: %DEPLOY_HOME%

set REMOTE_HOME=%PHP_HOME%/%SERVICE%
echo REMOTE_HOME: %REMOTE_HOME%

cd %HOME_DIR%
setlocal EnableDelayedExpansion
set /a num=%random% %%4 +1
set verify=!ENVIRONMENT! !SERVICE:~0,%num%! %GROUP%
setlocal DisableDelayedExpansion

IF /I NOT "%ENVIRONMENT%"=="live" goto END

set /p ANSWER="Are you sure? Press "%verify%" to continue? "
IF /I NOT "%ANSWER%"=="%verify%" (
	echo VERIFY FAIL
	goto ERROR
)

goto END
:ERROR
color 4E
echo *************** HAVE ERROR ***************
pause
color 07
EXIT /B 1

:END
