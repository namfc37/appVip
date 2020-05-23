@echo off
setlocal ENABLEDELAYEDEXPANSION
cls
color 07


:CONFIG
echo.
echo Config...
call config.bat
set HAS_LIB=0
for %%I in (%LIBRARY%) do (
    set HAS_LIB=1
)
if /I "%1"=="src" (
    goto COMPILE
)


:CLEAN_DIR
echo.
echo Clean folder...
if exist %DIR_TEMP_SRC% rd /s /q %DIR_TEMP_SRC%
if exist %DIR_TEMP_CLASS% rd /s /q %DIR_TEMP_CLASS%
if exist %DIR_TEMP% rd /s /q %DIR_TEMP%
if exist %DIR_RELEASE_LIB% rd /s /q %DIR_RELEASE_LIB%
if exist %DIR_RELEASE_DATA% rd /s /q %DIR_RELEASE_DATA%
if exist %DIR_RELEASE% rd /s /q %DIR_RELEASE%
if /I "%1"=="clean" (
    goto END
)


:CREATE_DIR
echo.
echo Create folder...
if not exist %DIR_TEMP% md %DIR_TEMP%
if not exist %DIR_TEMP_SRC% md %DIR_TEMP_SRC%
if not exist %DIR_TEMP_CLASS% md %DIR_TEMP_CLASS%
if not exist %DIR_RELEASE% md %DIR_RELEASE%
if not exist %DIR_RELEASE_LIB% md %DIR_RELEASE_LIB%
if not exist %DIR_RELEASE_DATA% md %DIR_RELEASE_DATA%

echo cd..>%DIR_RELEASE%\make.bat
echo call make.bat>>%DIR_RELEASE%\make.bat
attrib +h %DIR_RELEASE%\make.bat

echo cd..>%DIR_RELEASE%\make_src.bat
echo call make_src.bat>>%DIR_RELEASE%\make_src.bat
attrib +h %DIR_RELEASE%\make_src.bat

echo cd..>%DIR_RELEASE%\run.bat
echo call run.bat>>%DIR_RELEASE%\run.bat
attrib +h %DIR_RELEASE%\run.bat


:MAKE_DATA
call make_data.bat


:COPY_LIB
echo.
echo Copy lib...
for %%I in (%LIBRARY%) do (
    copy /y %%I %DIR_RELEASE_LIB%\>nul 2>nul
)


:COMPILE
echo.
echo Compile source...
cd %DIR_TEMP%
dir /s /b %DIR_SRC%\*.java>listjava.txt
if %HAS_LIB%==1 (
    %JAVAC% -Xlint:unchecked -Xlint:deprecation -encoding UTF-8 -classpath %LIBRARY% -d "%DIR_TEMP_CLASS%" @listjava.txt
) else (
    %JAVAC% -Xlint:unchecked -Xlint:deprecation -encoding UTF-8 -d "%DIR_TEMP_CLASS%" @listjava.txt
)
if ERRORLEVEL 1 goto ERROR


:MANIFEST
echo.
echo Create MANIFEST.MF...
cd %DIR_TEMP%

REM if %HAS_LIB%==1 (
    REM set LIBRARY=%LIBRARY:;=,%
    REM set CLASS_PATH=Class-Path:
    REM for %%I in (%LIBRARY%) do (
      REM set CLASS_PATH=!CLASS_PATH! lib/%%~nxI
    REM )
REM )

echo Build-Version: %BUILD_VERSION%>MANIFEST.MF
echo Build-Time: %date% %time%>>MANIFEST.MF
echo Build-User: %username%>>MANIFEST.MF
echo Build-Computer: %COMPUTERNAME%>>MANIFEST.MF
REM if %HAS_LIB%==1 (
    REM echo %CLASS_PATH%>>MANIFEST.MF
REM )
echo Main-Class: %MAIN_CLASS%>>MANIFEST.MF


:JAR
echo.
echo Make jar...
cd %DIR_TEMP_CLASS%
%JAR% -cmf ..\MANIFEST.MF %DIR_RELEASE%\%JAR_NAME% .


goto END
:ERROR
color 4E
echo *************** HAVE ERROR ***************
pause
color 07


:END
echo.
echo Done.
cd %PRJ_HOME%