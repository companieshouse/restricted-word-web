#!/bin/bash
# Start script for restricted-word-web

PORT=3000
export NODE_PORT=${PORT}
export RESTRICTED_WORD_WEB_PORT=${PORT}

exec node /opt/dist/app.js -- ${PORT}