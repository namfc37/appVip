call config.bat

set DIR_JSON_OUT=%1
set JSON_TYPE=%2
set DIR_SRC_OUT=%3
echo Exporting Excel files to json: %JSON_TYPE%...
pushd %EXPORT_EXCEL_HOME%
call %JAVA% -jar %EXPORT_EXCEL_JAR% const %DIR_EXCEL_DATA% %DIR_JSON_OUT% %JSON_TYPE% %DIR_SRC_OUT%
popd
echo Done.

echo.
