@echo off

call replaceConfig.bat GAME 1 extension.GameExtension

%JAVA% -ea -Xms16m -Xmx128m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" bitzero.server.Main
REM %JAVA% -ea -Xms128m -Xmx512m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" service.balance.BalanceServer


cd %PRJ_HOME%