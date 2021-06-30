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
RESTRICTED_WORD_ADMIN_WEB_PORT              | Application Port                                                          | 8080
INTERNAL_API_URL                            | URL to Restricted Word Api                                                | http://internalapi.chs-dev.internal:4001
CHS_INTERNAL_API_KEY                        | Internal API Key

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

_remember to run `rm -rf node_modules && npm install` when you switch between mac and vagrant environments when developing._

1. Start restricted-word-web via ubic (it is in the chs.chips group).
2. In a browser go to <http://web.chs-dev.internal:4000/admin/restricted-word>.

### AWS Test

The application is installed via the restricted-word-web concourse pipeline.

In a browser go to <https://[E2E Environment].aws.chdev.org/admin/restricted-word>. Example:  https://parent1.aws.chdev.org/admin/restricted-word
