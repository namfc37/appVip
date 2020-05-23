@echo off

call verifyJava.bat %1 %2 %3
IF %ERRORLEVEL% NEQ 0 goto END

set USE_MKDIR=false
set USE_START=true

set SCRIPT=tempScript
del %SCRIPT%>nul 2>nul

if /I "%USE_MKDIR%"=="true" (
    echo option batch continue >>%SCRIPT%
    echo mkdir %REMOTE_HOME%>>%SCRIPT%
)

if /I "%USE_START%"=="true" (
    echo cd %REMOTE_HOME%>>%SCRIPT%
    echo call sh ./service.sh stop>>%SCRIPT%    
)

echo synchronize remote -delete -transfer=automatic -criteria=either -filemask="|.idea/,logs/,_database_/" %DEPLOY_HOME% %REMOTE_HOME%>>%SCRIPT%
echo chmod 764 ./service.sh>>%SCRIPT%

if /I "%USE_START%"=="true" (    
    echo call sh ./service.sh start>>%SCRIPT%    
)

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
