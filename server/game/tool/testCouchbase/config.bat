REM if "%JAVA_HOME%"=="" (
    set JAVA_HOME=c:\Program Files\Java\jdk1.7.0_80
REM )

FOR /F %%i IN (version.txt) DO SET BUILD_VERSION=%%i

set JAR_NAME=Test_%BUILD_VERSION%.jar
set MAIN_CLASS=TestConnect

set PRJ_HOME=%cd%
set DIR_DATA=%PRJ_HOME%\data
set DIR_LIB=%PRJ_HOME%\lib
set DIR_SRC=%PRJ_HOME%\src
set DIR_TOOL=%PRJ_HOME%\tool

set LIBRARY=%DIR_LIB%\spymemcached.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\gson-2.8.5.jar

set DIR_TEMP=%PRJ_HOME%\_temp_
set DIR_TEMP_SRC=%DIR_TEMP%\0_src
set DIR_TEMP_CLASS=%DIR_TEMP%\1_class

set DIR_RELEASE=%PRJ_HOME%\_release_
set DIR_RELEASE_DATA=%DIR_RELEASE%\data
set DIR_RELEASE_LIB=%DIR_RELEASE%\lib

set JAVA="%JAVA_HOME%\bin\java"
set JAVAC="%JAVA_HOME%\bin\javac"
set JAR="%JAVA_HOME%\bin\jar"

