if "%JAVA_HOME%"=="" (
    set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_201
)

FOR /F %%i IN (version.txt) DO SET BUILD_VERSION=%%i

set JAR_NAME=ExportExcel.jar
set MAIN_CLASS=exportexcel.ExportExcel

set PRJ_HOME=%cd%
set DIR_DATA=%PRJ_HOME%\sgm.data
set DIR_LIB=%PRJ_HOME%\lib
set DIR_SRC=%PRJ_HOME%\src
set DIR_TOOL=%PRJ_HOME%\tool

set LIBRARY=%DIR_LIB%\gson-2.8.1.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\commons-lang3-3.0.1.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\guava-25.1-jre.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\netty-common-4.1.28.Final.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\poi-3.17.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\poi-excelant-3.17.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\poi-ooxml-3.17.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\poi-ooxml-schemas-3.17.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\poi-scratchpad-3.17.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\lib\commons-codec-1.10.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\lib\commons-collections4-4.1.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\lib\commons-logging-1.2.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\lib\junit-4.12.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\lib\log4j-1.2.17.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\ooxml-lib\curvesapi-1.04.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\ooxml-lib\xmlbeans-2.6.0.jar

set DIR_TEMP=%PRJ_HOME%\_temp_
set DIR_TEMP_SRC=%DIR_TEMP%\0_src
set DIR_TEMP_CLASS=%DIR_TEMP%\1_class

set DIR_RELEASE=%PRJ_HOME%\_release_
set DIR_RELEASE_DATA=%DIR_RELEASE%\sgm.data
set DIR_RELEASE_LIB=%DIR_RELEASE%\lib

set JAVA="%JAVA_HOME%\bin\java"
set JAVAC="%JAVA_HOME%\bin\javac"
set JAR="%JAVA_HOME%\bin\jar"

set FLATC=%PRJ_HOME%\..\FlatBuffers\flatc.exe
