@echo off

del /q d:\Project\els\product\debug\kvtm_logstash.log >nul 2>&1

RD /q /s d:\Project\els\product\data >nul 2>&1
RD /q /s  d:\Project\els\product\logs >nul 2>&1
RD /q /s d:\Project\els\app\filebeat\6.4.0\data >nul 2>&1
RD /q /s d:\Project\els\app\logstash\6.4.0\logs >nul 2>&1

mkdir d:\Project\els\product\data >nul 2>&1
mkdir d:\Project\els\product\logs >nul 2>&1
