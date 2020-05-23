@echo off

echo.
echo *** COMMIT BUILD ***

cd %SYNC_TO%
echo %cd%

REM svn add * --force
REM svn commit -m "Auto build %SYNC_COUNTRY% %SYNC_ENV%"

git add -A
IF %ERRORLEVEL% NEQ 0 goto ERROR

git commit -m "Auto build %SYNC_COUNTRY% %SYNC_ENV%"
IF %ERRORLEVEL% NEQ 0 goto ERROR

git push
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