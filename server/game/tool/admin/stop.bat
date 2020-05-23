@echo off
set ENVIRONMENT=%1

echo.
echo -------------------------------------------------------------------
call stop.bat %ENVIRONMENT% balance 0

echo.
echo -------------------------------------------------------------------
call stop.bat %ENVIRONMENT% admin 11

echo.
echo -------------------------------------------------------------------
call stop.bat %ENVIRONMENT% friend 13

echo.
echo -------------------------------------------------------------------
call stop.bat %ENVIRONMENT% newsboard 12

echo.
echo -------------------------------------------------------------------
call stop.bat %ENVIRONMENT% game 1

echo.
echo -------------------------------------------------------------------
call stop.bat %ENVIRONMENT% game 2
