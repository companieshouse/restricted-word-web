#!/bin/bash
# Start script for restricted-word-web

PORT=3000
export NODE_PORT=${PORT}

exec node -r /opt/dist/otel.js /opt/dist/app.js -- ${PORT}