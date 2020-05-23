call config.bat

pushd %EXPORT_EXCEL_HOME%
set INPUT=%PRJ_HOME_CLIENT%\assets\Languages\lang.xlsx
set OUTPUT=%DIR_CLIENT_DATA%\localize
call %JAVA% -jar %EXPORT_EXCEL_JAR% text %INPUT% %OUTPUT%
popd


IF NOT %ERRORLEVEL%==0 GOTO ERRORHANDLER
echo SUCCESS !!!
GOTO END
:ERRORHANDLER
echo ERROR
:END

echo.