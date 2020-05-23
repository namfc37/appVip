@echo off

set HTTP_GIT=http://10.11.91.7:3000/KVTM/trunk.git
set FOLDER=x:\kvtm

call git.exe clone --progress --branch master -v "http://10.11.91.7:3000/KVTM/trunk.git" "%FOLDER%\trunk"
call git.exe clone --progress --branch master -v "http://10.11.91.7:3000/KVTM/trunk_web.git" "%FOLDER%\trunk_web"
call git.exe clone --progress --branch master -v "http://10.11.91.7:3000/KVTM/release_server.git" "%FOLDER%\release_server"

call initBranch.bat %HTTP_GIT% %FOLDER% live_vietnam
call initBranch.bat %HTTP_GIT% %FOLDER% live_sea
call initBranch.bat %HTTP_GIT% %FOLDER% live_brazil

call initBranch.bat %HTTP_GIT% %FOLDER% sandbox_vietnam
