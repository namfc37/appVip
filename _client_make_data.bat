@echo off
call config.bat

echo Building data for Client ...
call make_json_constants.bat %DIR_CLIENT_JSON_OUT% client
call make_text_client.bat

@echo on
echo %cd%
move %DIR_CLIENT_JSON_OUT%\user_level.json %PRJ_HOME%\client\res

echo.

rem copy language files to their folders
rem goto end
move %PRJ_HOME_CLIENT%\res\localize\br.txt %PRJ_HOME_CLIENT%\env\brazil\res\localize
move %PRJ_HOME_CLIENT%\res\localize\go.txt %PRJ_HOME_CLIENT%\env\global\res\localize
move %PRJ_HOME_CLIENT%\res\localize\mm.txt %PRJ_HOME_CLIENT%\env\myanmar\res\localize
move %PRJ_HOME_CLIENT%\res\localize\ph.txt %PRJ_HOME_CLIENT%\env\philippine\res\localize
move %PRJ_HOME_CLIENT%\res\localize\th.txt %PRJ_HOME_CLIENT%\env\thailand\res\localize

:end