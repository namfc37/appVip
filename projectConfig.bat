set JAVA="%JAVA_HOME%\bin\java"
set JAVAC="%JAVA_HOME%\bin\javac"
set JAR="%JAVA_HOME%\bin\jar"

set PRJ_HOME=%CD%

set PRJ_HOME_SERVER=%PRJ_HOME%\server\game
set DIR_SERVER_DATA=%PRJ_HOME_SERVER%\data
set DIR_SERVER_SRC=%PRJ_HOME_SERVER%\src

set PRJ_HOME_CLIENT=%PRJ_HOME%\client
set DIR_CLIENT_DATA=%PRJ_HOME_CLIENT%\res
set DIR_CLIENT_SRC=%PRJ_HOME_CLIENT%\src

set PRJ_HOME_DESIGN=%PRJ_HOME%\design
set DIR_EXCEL_DATA=%PRJ_HOME_DESIGN%\db

set DIR_TOOL=%PRJ_HOME%\tools

rem Export excel files to json
set DIR_SERVER_JSON_OUT=%DIR_SERVER_DATA%\jsonConstants
set DIR_SERVER_SRC_OUT=%DIR_SERVER_SRC%\data
set DIR_CLIENT_JSON_OUT=%DIR_CLIENT_SRC%\constants
set EXPORT_EXCEL_HOME=%DIR_TOOL%\ExportExcel\_release_
set EXPORT_EXCEL_JAR=ExportExcel.jar

rem Export text
set PYTHON_SCRIPT=%PRJ_HOME_CLIENT%\assets\PythonScripts