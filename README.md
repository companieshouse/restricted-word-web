# Restricted Word Admin Web

## Summary

This web app is for users to administrate the restricted words by viewing, searching, adding and deleting them.

## Description (for branch)

This is an internal system that a small (four or five) business users will use to maintain a list of restricted words.

This application is part of the CHS Beta admin pages so the user needs to be given the CHS role that has permissions to access the page "/admin/restricted-word" (the role itself is names "restricted-word")

## Environment Variables

The following is a list of mandatory environment variables for the service to run:

Name                                        | Description                                                               | Example Value
------------------------------------------- | ------------------------------------------------------------------------- | ------------------------
RESTRICTED_WORD_ADMIN_WEB_PORT              | Application Port                                                          | 3000
INTERNAL_API_URL                            | URL to Restricted Word Api                                                | http://internalapi.chs-dev.internal:4001
CHS_INTERNAL_API_KEY                        | Internal API Key
RESTRICTED_WORD_WEB_PORT                    | Application Port                                                           3000

## Config variables

Key             | Example Value         | Description
----------------|-----------------------|------------------------------------
CACHE_SERVER    | localhost:6379        | Required for storing values in memory(Redis)
CDN_HOST        | http://cdn.chs.local  | Used when navigating to the webpage
COOKIE_DOMAIN   | chs.local             |
COOKIE_NAME     |__SID                  |
COOKIE_SECRET   |                       |

## Installation

1. Checkout from git
2. cd to top level directory
3. npm install  (this installs the dependencies)
4. make build

## Running in Docker locally

This project uses the node-base-image(https://github.com/companieshouse/node-base-image) to build docker images. If running locally and connecting to services on host machine use `host.docker.internal` in place of localhost for environment variables.

1. Create the following folder structure `~/.chs_env/restricted-word-web`. Inside the `restricted-word-web` folder create a file named `env` and place your environment variables inside.
2. Run `DOCKER_BUILDKIT=0 docker build --build-arg SSH_PRIVATE_KEY="<YOUR_PRIVATE_KEY>" --build-arg SSH_PRIVATE_KEY_PASSPHRASE -t restricted-word-web .`
3. Run `docker run --env-file ~/.chs_env/restricted-word-web/env -p 3000:3000 restricted-word-web`


## Testing

### Unit Tests
Run `npm run test` or `npm run test:coverage` (to get a coverage report).

### Local

1. Have the restricted word api running on your same machine.
2. In project home directory `npm start`
3. In browser go to <http://localhost:3001>

### Vagrant

_remember to run `rm -rf node_modules && npm install` when you switch between mac and vagrant environments when developing._

1. Start restricted-word-web via ubic (it is in the chs.chips group)
2. In a browser go to <http://web.chs-dev.internal:4000/admin/restricted-word>

### AWS Test

The application is installed via the restricted-word-web concourse pipeline.

In a browser go to <https://[E2E Environment].aws.chdev.org/admin/restricted-word>. Example:  https://parent1.aws.chdev.org/admin/restricted-word
