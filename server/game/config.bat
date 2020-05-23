if "%JAVA_HOME%"=="" (
    set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_241
)

FOR /F %%i IN (version.txt) DO SET BUILD_VERSION=%%i

REM set JAR_NAME=KVTM_%BUILD_VERSION%.jar
set JAR_NAME=kvtm.jar
set MAIN_CLASS=bitzero.server.Main

set PRJ_HOME=%cd%
set DIR_DATA=%PRJ_HOME%\data
set DIR_LIB=%PRJ_HOME%\lib
set DIR_SRC=%PRJ_HOME%\src
set DIR_TOOL=%PRJ_HOME%\tool

set LIBRARY=%DIR_LIB%\bz_allinone_websocket.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\commons-codec-1.5.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\commons-io-1.4.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\commons-lang3-3.4.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\commons-pool2-2.5.0.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\commons-logging-1.1.1.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\fb303.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\gson-2.8.6.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\httpclient_4.5.2.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\httpcore_4.4.4.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\json.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\libthrift-r917130.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\log4j-1.2.15.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\scribe.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\slf4j-api-1.6.1.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\slf4j-log4j12-1.6.1.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\spymemcached.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\xstream-1.3.1.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\netty-3.10.5.Final.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\netty-all-4.1.43.Final.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\guava-28.1-jre.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\broker.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\kafka-clients-2.0.0.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\kafka-streams-2.0.0.jar
set LIBRARY=%LIBRARY%;%DIR_LIB%\jedis-3.0.1.jar

set DIR_TEMP=%PRJ_HOME%\_temp_
set DIR_TEMP_SRC=%DIR_TEMP%\0_src
set DIR_TEMP_CLASS=%DIR_TEMP%\1_class

set DIR_RELEASE=%PRJ_HOME%\_release_
set DIR_RELEASE_DATA=%DIR_RELEASE%\data
set DIR_RELEASE_LIB=%DIR_RELEASE%\lib

set JAVA="%JAVA_HOME%\bin\java"
set JAVAC="%JAVA_HOME%\bin\javac"
set JAR="%JAVA_HOME%\bin\jar"

set DESGIN_HOME=%PRJ_HOME%\..\design\db
set JSON_CONST=%DIR_DATA%\jsonConstants
set EXPORT_EXCEL_HOME=%PRJ_HOME%\..\tools\ExportExcel\_release_
set EXPORT_EXCEL_JAR=ExportExcel.jar
set JAR_REPLACE_CONFIG=%DIR_TOOL%\admin\replace\_release_\replaceConfig.jar
