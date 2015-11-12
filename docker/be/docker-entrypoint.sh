#!/bin/bash -x
set -e

if [ "$1" = "start" ]; then
	exec /usr/bin/java -Dconfig.file=/usr/share/hevicado/hevicado.conf -Dlogback.configurationFile=/usr/share/hevicado/logback.xml -javaagent:/usr/share/hevicado/aspectjweaver.jar -jar /usr/share/hevicado/hevicado.jar
fi

exec "$@"
