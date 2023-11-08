# Restricted Word Admin Web

## Summary

This web app is for users to administrate restricted words by viewing, searching, adding and deleting them. 
As part of ECCT economic crime bill, the web app has been enhanced to add support for categorisation of the words to enable. Each word must be assigned to one or more categories. Any updates to a word's categories will also require a justification/reason to be provided. This also applies to any requests to delete an existing word
Restricted word matching can be filtered on the categories, which are `Restricted` (existing words that were added before this functionality was introduced will be classed as this), `International organisations and foreign government departments`,  `Names for criminal / fraudulent purposes` and `Names previously subjected to a direction to change them`.
For more information regarding the architecture design and justifications of the enhancements, click [here](https://companieshouse.atlassian.net/wiki/spaces/PS/pages/4260626528/Enhancing+restricted+word+service)


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


# Getting set up in Docker and Tilt
 1. If you have not done so already, clone [Docker CHS Development](https://github.com/compaiieshouse/docker-chs-development) and follow the steps in the README.
2. `cd` into `docker-chs-development`, and run: `./bin/chs-dev services enable restricted-word-web` .You should also enable `restricted-word-api` , you can do this using the same command `./bin/chs-dev services enable restricted-word-api`

Live update is also available for this service, this can be enabled by by running `./bin/chs-dev development enable restricted-word-web`

3. Run docker using `tilt up` from the `docker-chs-development` directory.
4. Use spacebar in the command line to open tilt window - wait for `restricted-word-web` and `restricted-word-api`  to turn green.
5. Open your browser and go to page http://chs.local/admin/restricted-word.


# Note
You will also need to make sure your chosen 'user' has the 'restricted-word' role assigned to them. You should also ensure that you login as an administrator to be able to access http://chs.local/admin/restricted-word. or you will encounter Page Not Found error. 

### Running Docker locally

This project uses the node-base-image(https://github.com/companieshouse/node-base-image) to build docker images. If running locally and connecting to services on host machine use `host.docker.internal` in place of localhost for environment variables.

1. Create the following folder structure `~/.chs_env/restricted-word-web`. Inside the `restricted-word-web` folder create a file named `env` and place your environment variables inside.
2. Run `DOCKER_BUILDKIT=0 docker build --build-arg SSH_PRIVATE_KEY="<YOUR_PRIVATE_KEY>" --build-arg SSH_PRIVATE_KEY_PASSPHRASE -t restricted-word-web .`
3. Run `docker run --env-file ~/.chs_env/restricted-word-web/env -p 3000:3000 restricted-word-web`


## Testing

### Unit Tests
Run `npm run test` or `npm run test:coverage` (to get a coverage report).

### AWS Test

The application is installed via the restricted-word-web concourse pipeline.

In a browser go to <https://[E2E Environment].aws.chdev.org/admin/restricted-word>. Example:  https://parent1.aws.chdev.org/admin/restricted-word