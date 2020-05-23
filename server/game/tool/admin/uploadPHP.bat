@echo off

call verifyPHP.bat %1 %2
IF %ERRORLEVEL% NEQ 0 goto END

set USE_MKDIR=false

set SCRIPT=tempScript
del %SCRIPT%>nul 2>nul

if /I "%USE_MKDIR%"=="true" (
    echo option batch continue >>%SCRIPT%
    echo mkdir %REMOTE_HOME%>>%SCRIPT%
)

echo synchronize remote -delete -transfer=automatic -criteria=either -filemask="|.idea/,logs/,_database_/" %DEPLOY_HOME% %REMOTE_HOME%>>%SCRIPT%

echo close>>%SCRIPT%
echo exit>>%SCRIPT%

echo.
echo.
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
cd %HOME_DIR%
