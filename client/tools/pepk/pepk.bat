@echo off
set KEY_STORE=..\..\build\build.keystore
set KEY_SIGNING=..\..\build\appSigning.key

java -jar pepk.jar --keystore=%KEY_STORE% --alias=gsn --output=%KEY_SIGNING% --encryptionkey=eb10fe8f7c7c9df715022017b00c6471f8ba8170b13049a11e6c09ffe3056a104a3bbe4ac5a955f4ba4fe93fc8cef27558a3eb9d2a529a2092761fb833b656cd48b9de6a