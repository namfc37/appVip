@echo off

echo.
echo *** MERGE FROM TRUNK ***

if /I "%SYNC_ENV%"=="dev" (
    echo skip merge in env %SYNC_ENV%
    goto END
)

cd %SYNC_FROM%
echo %cd%
REM svn merge %SVN_TRUNK%
git merge origin/master
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