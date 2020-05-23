@echo off

call replaceConfig.bat CHAT 3 extension.ChatExtension

%JAVA% -ea -Xms16m -Xmx128m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" bitzero.server.Main
rem %JAVA% -ea -Xms16m -Xmx64m -classpath "%LIBRARY%;%DIR_RELEASE%\%JAR_NAME%" service.friend.FriendServer


cd %PRJ_HOME%