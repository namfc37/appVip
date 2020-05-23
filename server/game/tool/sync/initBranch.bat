@echo off

set HTTP_GIT=%1
set FOLDER=%2
set BRANCH=%3

echo.
call git.exe clone --progress --branch %BRANCH% -v "%HTTP_GIT%" "X:\kvtm\%BRANCH%"