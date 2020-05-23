@echo off
call config.bat

echo Building data for Server ...
call make_json_constants.bat %DIR_SERVER_JSON_OUT% server %DIR_SERVER_SRC_OUT%

echo.