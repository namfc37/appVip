@echo off
setlocal ENABLEDELAYEDEXPANSION
REM cls
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
REM if exist %DIR_RELEASE_LIB% rd /s /q %DIR_RELEASE_LIB%
REM if exist %DIR_RELEASE_DATA% rd /s /q %DIR_RELEASE_DATA%
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
REM if not exist %DIR_RELEASE_LIB% md %DIR_RELEASE_LIB%
REM if not exist %DIR_RELEASE_DATA% md %DIR_RELEASE_DATA%

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


REM :COPY_LIB
REM echo.
REM echo Copy lib...
REM for %%I in (%LIBRARY%) do (
    REM copy /y %%I %DIR_RELEASE_LIB%\>nul 2>nul
REM )


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

cd %PRJ_HOME%

REM call svn info --show-item revision>curRevision.txt
call git rev-parse --short HEAD>curRevision.txt
set /p SVN_REVISION=<curRevision.txt
del curRevision.txt

cd %DIR_TEMP%
REM if %HAS_LIB%==1 (
    REM set LIBRARY=%LIBRARY:;=,%
    REM set CLASS_PATH=Class-Path:
    REM for %%I in (%LIBRARY%) do (
      REM set CLASS_PATH=!CLASS_PATH! lib/%%~nxI
    REM )
REM )
echo Built-Version: %SVN_REVISION%>MANIFEST.MF
echo Built-Time: %date% %time%>>MANIFEST.MF
REM echo Built-User: %username%>>MANIFEST.MF
echo Built-By: %COMPUTERNAME%>>MANIFEST.MF
REM if %HAS_LIB%==1 (
    REM echo %CLASS_PATH%>>MANIFEST.MF
REM )
echo Main-Class: %MAIN_CLASS%>>MANIFEST.MF

:UPDATE_JARNAME
set JAR_NAME_SH=%DIR_TOOL%\admin\script\jarName.sh

echo jarName="kvtm.jar">%JAR_NAME_SH%
echo.>>%JAR_NAME_SH%
echo classPath="$jarName">>%JAR_NAME_SH%
for %%I in (%LIBRARY%) do (
    echo classPath+=":lib/%%~nxI">>%JAR_NAME_SH%
)


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