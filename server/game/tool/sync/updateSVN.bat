@echo off

echo.
echo *** UPDATE SVN ***

cd %SYNC_FROM%
echo SYNC: %cd%
REM svn update
git pull origin master
git pull origin %BRANCH%
IF %ERRORLEVEL% NEQ 0 goto ERROR

echo.
cd %SYNC_TO%
echo SYNC: %cd%
REM svn update
git pull origin master
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
