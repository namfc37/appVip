@echo off

rem call config.bat
REM cd %DIR_RELEASE%
REM %JAVA% -Xms16m -Xmx64m -jar %JAR_NAME%
REM %JAVA% -javaagent:./lib/misc/jamm-0.3.1.jar -Xms16m -Xmx64m -Dio.netty.leakDetectionLevel=advanced -classpath "%LIBRARY%;%JAR_NAME%" -Djava.library.path=./lib/native %MAIN_CLASS%
REM %JAVA% -Xms128m -Xmx512m -Dio.netty.leakDetectionLevel=advanced -classpath "%LIBRARY%;%JAR_NAME%" -Djava.library.path=./lib/native %MAIN_CLASS%
rem %JAVA% -ea -Xms128m -Xmx512m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" %MAIN_CLASS%
REM %JAVA% -ea -Xms128m -Xmx512m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" service.balance.BalanceServer

call replaceConfig.bat GAME 1 extension.GameExtension
%JAVA% -ea -Xms16m -Xmx128m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" bitzero.server.Main


cd %PRJ_HOME%