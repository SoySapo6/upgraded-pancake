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

# Detectar JAR de Paper disponible
if [ -f "paper.jar" ]; then
    JAR_FILE="paper.jar"
else
    JAR_FILE=$(ls paper-*.jar 2>/dev/null | head -n1)
fi

# Verificar que existe el JAR
if [ -z "$JAR_FILE" ] || [ ! -f "$JAR_FILE" ]; then
    exit 1
fi

$JAVA_PATH -Xmx256M -Xms128M -XX:+UseSerialGC -XX:+DisableExplicitGC -XX:-UseGCOverheadLimit -jar "$JAR_FILE" --port "$SERVER_PORT" nogui
