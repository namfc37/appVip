@echo off
call config.bat

cd %DIR_RELEASE%

REM %JAVA% -Xms16m -Xmx64m -jar %JAR_NAME%
REM %JAVA% -javaagent:./lib/misc/jamm-0.3.1.jar -Xms16m -Xmx64m -Dio.netty.leakDetectionLevel=advanced -classpath "%LIBRARY%;%JAR_NAME%" -Djava.library.path=./lib/native %MAIN_CLASS%
REM %JAVA% -Xms128m -Xmx512m -Dio.netty.leakDetectionLevel=advanced -classpath "%LIBRARY%;%JAR_NAME%" -Djava.library.path=./lib/native %MAIN_CLASS%

%JAVA% -jar %JAR_NAME% const ..\..\..\design\db ..\data server ..\data


cd %PRJ_HOME%