if "%JAVA_HOME%"=="" (
    set JAVA_HOME=c:\Program Files\Java\jdk1.8.0_171
)

FOR /F %%i IN (version.txt) DO SET BUILD_VERSION=%%i

set JAR_NAME=configVersion.jar
set MAIN_CLASS=ConfigVersion

set PRJ_HOME=%cd%
set DIR_DATA=%PRJ_HOME%\data
set DIR_LIB=%PRJ_HOME%\lib
set DIR_SRC=%PRJ_HOME%\src
set DIR_TOOL=%PRJ_HOME%\tool

set LIBRARY=%DIR_LIB%\gson-2.8.6.jar
REM set LIBRARY=%LIBRARY%;%DIR_LIB%\yyy.jar

set DIR_TEMP=%PRJ_HOME%\_temp_
set DIR_TEMP_SRC=%DIR_TEMP%\0_src
set DIR_TEMP_CLASS=%DIR_TEMP%\1_class

set DIR_RELEASE=%PRJ_HOME%\_release_
set DIR_RELEASE_DATA=%DIR_RELEASE%\data
set DIR_RELEASE_LIB=%DIR_RELEASE%\lib

set JAVA="%JAVA_HOME%\bin\java"
set JAVAC="%JAVA_HOME%\bin\javac"
set JAR="%JAVA_HOME%\bin\jar"

