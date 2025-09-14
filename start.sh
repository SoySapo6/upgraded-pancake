#!/bin/bash

./java8/bin/java -Xmx256M -Xms128M -XX:+UseSerialGC -XX:+DisableExplicitGC -XX:-UseGCOverheadLimit -jar paper.jar --port 12005 nogui