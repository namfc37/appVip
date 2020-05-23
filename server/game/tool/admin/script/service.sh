serviceCmd=`readlink -f $0`
serviceDir="${serviceCmd%/*}"
serviceFile="${serviceCmd##*/}"
serviceLogFile="/$serviceDir/logs/_$serviceFile.log"

source "$serviceDir/jarName.sh"
source "$serviceDir/config.sh"
startCmd="java $javaArgument -classpath $classPath $mainClass $appArgument"

checkMark=1
# ulimit -HSn 32768

function getPid(){	
    pid=`ps aux | grep $jarName | grep $serviceName |grep -v grep | awk '{print $2}'`
    echo $pid
}

function isStarted(){
	if [ "$checkMark" -eq 0 ] ; then
		pid=`getPid`
		if [ $pid ];  then			
			echo 1
		else
			echo 0
		fi
	else
		Started=`cat $serviceLogFile | grep -ic "MARK_SERVICE_STARTED"`
		echo $Started
	fi
}

function isStartFail(){
	if [ "$checkMark" -eq 0 ] ; then
		echo 0
	else
		errors=`cat $serviceLogFile | grep -ic "Exception\|MARK_SERVICE_HAS_EXCEPTION\|MARK_SERVICE_STATUS_SHUTTING_DOWN\|MARK_SERVICE_STATUS_SHUTDOWN"`
		echo $errors
	fi	
}

function startService() {
    cd $serviceDir
    mkdir -p logs
    echo -n "Starting $serviceName "
    pid=`getPid`
    count=0
    if [ $pid ];  then
		echo "Already Started !!! PID=$pid"
    else
        nohup $startCmd > $serviceLogFile 2>&1 &		
		while [ `isStarted` -eq 0 ]
		do
			count=$((count + 1))		
			if [ $(( $count % 10 )) -eq 0 ] ; then
				echo -n "`expr $count / 10`"
			else
				echo -n "."
			fi
			if [ `isStartFail` -gt 0 ];
			then
				cat $serviceLogFile
				stopService
				return
			fi

			sleep 0.1
		done
		pid=`getPid`
		if [ $pid ];  then
			echo -n "[OK] PID=$pid"
			echo ""                  
			return 1
		else
			echo -n "[FAIL]"
			echo ""
		fi
	fi
    return 0;
}

function stopService {
    echo -n "Stopping $serviceName "
    pid=`getPid`
    if [ $pid ];  then
        kill -15 $pid
		if [ "$checkMark" -eq 0 ] ; then
			echo -n "Kill PID=$pid"
		else
			count=0
			while [ `getPid` ]
			do
				count=$((count + 1))		
				if [ $(( $count % 10 )) -eq 0 ] ; then
					echo -n "`expr $count / 10`"
				else
					echo -n "."
				fi
				sleep 0.1
			done
			echo -n "[OK]"
		fi		
		echo ""
    else
		echo -n "[Not Running]"
		echo ""
    fi
    return 0;
}

function checkServiceStatus {
    echo -n "Checking for Server $jarName:   "
    pid=`getPid`
    if [ $pid ];  then
        echo "running PID=$pid"
    else
        echo "stopped"
    fi
    return 0;
}

function callTop {
    echo -n "Call top for Server $jarName:   "
    pid=`getPid`
    if [ $pid ];  then
        top -p $pid
    else
        echo "Not Running"
    fi
    return 0;
}

function main {
   RETVAL=0
   case "$1" in
      start)
         startService
         ;;
      stop)
         stopService
         ;;
      restart)
         stopService && startService
         ;;
      status)
         checkServiceStatus
         ;;
      top)
         callTop
         ;;
      *)
         echo "Usage: $0 {start|stop|restart|status}"
         exit 1
         ;;
      esac
   exit $RETVAL
}

main $1
