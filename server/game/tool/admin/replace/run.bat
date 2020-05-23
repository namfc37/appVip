@echo off
call config.bat

cd %DIR_RELEASE%

REM %JAVA% -Xms16m -Xmx64m -jar %JAR_NAME%
REM %JAVA% -javaagent:./lib/misc/jamm-0.3.1.jar -Xms16m -Xmx64m -Dio.netty.leakDetectionLevel=advanced -classpath "%LIBRARY%;%JAR_NAME%" -Djava.library.path=./lib/native %MAIN_CLASS%
REM %JAVA% -Xms128m -Xmx512m -Dio.netty.leakDetectionLevel=advanced -classpath "%LIBRARY%;%JAR_NAME%" -Djava.library.path=./lib/native %MAIN_CLASS%

REM %JAVA% -Xms128m -Xmx512m -classpath "%LIBRARY%;%JAR_NAME%" %MAIN_CLASS%
%JAVA% -jar %JAR_NAME% x:\KVTM\trunk\server\game\conf\cluster.properties ADMIN 11
%JAVA% -jar %JAR_NAME% x:\KVTM\trunk\server\game\config\server.xml ADMIN 11


cd %PRJ_HOME%