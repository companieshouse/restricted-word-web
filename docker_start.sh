#!/bin/bash
# Start script for restricted-word-web
PORT=3000
export NODE_PORT=${PORT}
exec node /opt/app -- ${PORT}