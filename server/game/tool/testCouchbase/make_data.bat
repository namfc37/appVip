@echo off
call config.bat

copy /y %DIR_DATA%\*.* %DIR_RELEASE_DATA% >nul