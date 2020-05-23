@echo off

call replaceConfig.bat NEWSBOARD 12

rem %JAVA% -ea -Xms16m -Xmx128m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" bitzero.server.Main
%JAVA% -ea -Xms16m -Xmx64m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" service.newsboard.NewsBoardServer


cd %PRJ_HOME%