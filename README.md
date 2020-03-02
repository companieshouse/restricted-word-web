# Restricted Word Admin Web

## Summary

This web app is for users to administrate the restricted words by viewing, searching, adding and deleting them.

## Description (for branch)

This is a prototype for an internal system that a small (four or five) business users will use to maintain a list of restricted words.

Login will be via the standard CHS login and will check for specific roles for that user

## Environment Variables

The following is a list of mandatory environment variables for the service to run:

Name                                        | Description                                                               | Example Value
------------------------------------------- | ------------------------------------------------------------------------- | ------------------------
RESTRICTED_WORD_ADMIN_WEB_PORT                    | Application Port                                                          | 8080
RESTRICTED_WORD_ADMIN_WEB_API_URL                 | URL to Restricted Word Api                                                | https://localhost:8080/restricted-word

## Installation

1. Checkout from git
2. cd to top level directory
3. npm install  (this installs the dependencies)
4. make build

## Testing  

### Local

1. Have the restricted word api running on your same machine
2. In project home directory `npm start`
3. In browser go to <http://localhost:3001>

### Vagrant

1. Start restricted-word-web via ubic (it is in the chs.chips group)
2. In a browser go to <http://web.chs-dev.internal:4000/restricted-word>

### AWS Test

The application is installed via the restricted-word-web concourse pipeline.

In a browser go to <https://[E2E Environment].aws.chdev.org/restricted-word>. Example:  https://parent1.aws.chdev.org/restricted-word
