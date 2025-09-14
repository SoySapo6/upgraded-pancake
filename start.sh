#!/bin/bash

# Detectar carpeta de Java disponible
if [ -d "java21" ]; then
    JAVA_PATH="./java21/bin/java"
elif [ -d "java17" ]; then
    JAVA_PATH="./java17/bin/java"
elif [ -d "java11" ]; then
    JAVA_PATH="./java11/bin/java"
elif [ -d "java8" ]; then
    JAVA_PATH="./java8/bin/java"
else
    JAVA_PATH="java"
fi

$JAVA_PATH -Xmx256M -Xms128M -XX:+UseSerialGC -XX:+DisableExplicitGC -XX:-UseGCOverheadLimit -jar paper.jar --port "$SERVER_PORT" nogui
