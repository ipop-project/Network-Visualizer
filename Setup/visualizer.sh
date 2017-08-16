#!/bin/bash

function help()
{
	echo 'Enter start or stop as argument'
}

function options
{
    read -p "$(help) `echo $'\n> '`" user_input
    echo $user_input
}


function start()
{
	source ./venv/bin/activate
	nohup python ./Collector/Collector.py &> /dev/null &
	sleep 2s
	nohup python ./CentralVisualizer/CentralVisualizer.py &> /dev/null &
}

function stop()
{
	ps aux | grep -v grep | grep "CentralVisualizer.py" | awk '{print $2}' | xargs sudo kill -9
	ps aux | grep -v grep | grep "Collector.py" | awk '{print $2}' | xargs sudo kill -9
}

cmd=$1
if [[ -z $cmd ]] ; then
    line=($(options))
    cmd=${line[0]}
fi

case $cmd in
    ("start")
        start
    ;;
    ("stop")
        stop
    ;;  
esac
