@echo off
REM call clean

start "elasticsearch" D:\Project\els\app\elasticsearch\6.4.0\bin\elasticsearch.bat

ping 127.0.0.1 -n 6 > nul
start "kibana" D:\Project\els\app\kibana\6.4.0\bin\kibana.bat

ping 127.0.0.1 -n 20 > nul
start "logstash" D:\Project\els\app\logstash\6.4.0\bin\logstash.bat -f d:\Project\els\product\config\kvtm_logstash.conf

ping 127.0.0.1 -n 30 > nul
start "filebeat" D:\Project\els\app\filebeat\6.4.0\filebeat.exe -e -c d:\Project\els\product\config\kvtm_filebeat.yml