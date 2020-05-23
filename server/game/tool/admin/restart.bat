@echo off
set ENVIRONMENT=%1

echo.
echo -------------------------------------------------------------------
call restart.bat %ENVIRONMENT% balance 0

echo.
echo -------------------------------------------------------------------
call restart.bat %ENVIRONMENT% admin 11

echo.
echo -------------------------------------------------------------------
call restart.bat %ENVIRONMENT% friend 13

echo.
echo -------------------------------------------------------------------
call restart.bat %ENVIRONMENT% newsboard 12

echo.
echo -------------------------------------------------------------------
call restart.bat %ENVIRONMENT% game 1

echo.
echo -------------------------------------------------------------------
call restart.bat %ENVIRONMENT% game 2
