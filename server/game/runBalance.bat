@echo off

call replaceConfig.bat BALANCE 0

rem %JAVA% -ea -Xms16m -Xmx128m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" bitzero.server.Main
%JAVA% -ea -Xms16m -Xmx64m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" service.balance.BalanceServer


cd %PRJ_HOME%