@echo off

echo.
echo *** MAKE JAVA ***

cd %SYNC_FROM_SERVER%\game
call make.bat

cd %SYNC_HOME%