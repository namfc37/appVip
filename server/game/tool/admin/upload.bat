@echo off
CLS
set ENVIRONMENT=%1

set CONFIG_BAT=config%ENVIRONMENT%.bat
if not exist %CONFIG_BAT% (	
	echo NOT EXIST FILE %CONFIG_BAT%
	goto ERROR
)

set verify=%ENVIRONMENT%
IF /I "%ENVIRONMENT%"=="live" set verify=Upload Live
set /p ANSWER="Are you sure? Press "%verify%" to continue? "
IF /I NOT "%ANSWER%"=="%verify%" (
	echo NOT VERIFY FAIL
	goto ERROR
)

echo.
echo -------------------------------------------------------------------
REM call uploadJava.bat %ENVIRONMENT% balance 0

echo.
echo -------------------------------------------------------------------
REM call uploadJava.bat %ENVIRONMENT% admin 11

echo.
echo -------------------------------------------------------------------
REM call uploadJava.bat %ENVIRONMENT% friend 13

echo.
echo -------------------------------------------------------------------
REM call uploadJava.bat %ENVIRONMENT% newsboard 12

echo.
echo -------------------------------------------------------------------
REM call uploadJava.bat %ENVIRONMENT% game 1

echo.
echo -------------------------------------------------------------------
REM call uploadJava.bat %ENVIRONMENT% game 2

echo.
echo -------------------------------------------------------------------
REM call uploadPHP.bat %ENVIRONMENT% billing

echo.
echo -------------------------------------------------------------------
call uploadPHP.bat %ENVIRONMENT% gm


goto END
:ERROR
color 4E
echo *************** HAVE ERROR ***************
pause
color 07
EXIT /B 1

:END
