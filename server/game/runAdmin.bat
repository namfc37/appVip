@echo off

call replaceConfig.bat ADMIN 11

rem %JAVA% -ea -Xms16m -Xmx128m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" bitzero.server.Main
%JAVA% -ea -Xms16m -Xmx64m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" service.admin.Admin


cd %PRJ_HOME%