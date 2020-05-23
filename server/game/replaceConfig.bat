@echo off
call config.bat

set service=%1
set group=%2
set extension=%3

%JAVA% -jar %JAR_REPLACE_CONFIG% conf\cluster.properties %service% %group% %extension%
move cluster.properties conf\

%JAVA% -jar %JAR_REPLACE_CONFIG% config\server.xml %service% %group%
move server.xml config\