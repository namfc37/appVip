@echo off

call _verifyParams.bat %1 %2 %3
IF %ERRORLEVEL% NEQ 0 goto END

set SCRIPT=tempScript
set REMOTE_DIR=%REMOTE_HOME%/%SERVICE%_%GROUP%


del %SCRIPT%>nul 2>nul
echo option batch abort>>%SCRIPT%
echo cd %REMOTE_DIR%>>%SCRIPT%
echo call sh ./service.sh stop>>%SCRIPT%
REM echo get -transfer=ascii %REMOTE_DIR%/logs/_service.sh.log %HOME_DIR%\>>%SCRIPT%
echo close>>%SCRIPT%
echo exit>>%SCRIPT%

for /F "delims=" %%s in (server\%ENVIRONMENT%\%SERVICE%.txt) do (
	echo Server: %%s
	echo open %%s>runScript
	type %SCRIPT% >>runScript
	WinSCP\winscp.com /script=runScript
	echo.
	echo.
)

del runScript>nul 2>nul
del %SCRIPT%>nul 2>nul

:END
