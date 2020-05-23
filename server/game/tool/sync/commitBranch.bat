@echo off

echo.
echo *** COMMIT BRANCH ***

if /I "%SYNC_ENV%"=="dev" (
    echo skip commit in env %SYNC_ENV%
    goto END
)

cd %SYNC_FROM%
echo %cd%
REM svn commit -m "Auto merge from trunk to branch %SYNC_COUNTRY% %SYNC_ENV%"
git push origin %BRANCH%
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