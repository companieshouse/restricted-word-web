# Express 5 Discovery

## Current versions

- `package.json` requests Express `^4.22.2` and `@types/express` `~4.17.25`.
- The installed versions are Express `4.22.3` and `@types/express` `4.17.25`.
- Direct Express-related packages include `cookie-parser` and Helmet. Express provides `body-parser` as a transitive dependency.
- `express-async-handler` is transitive through `@companieshouse/node-session-handler` and `@companieshouse/web-security-node`.
- Nunjucks is configured to use the Express app. The Companies House session, security, and logging packages provide middleware.

## Routes and responses

- Routes use ordinary `express.Router()` paths. No legacy wildcard, optional, or regular-expression route patterns were found.
- Most controller responses render HTML. Successful create, update, and delete requests redirect. The health check returns `200 OK`.
- CSRF errors render the `403` page. Unknown routes and signed-in users without permission render the `404` page. Unauthenticated users are redirected to sign-in.
- The app uses `express.urlencoded({ extended: true })`. It does not set the query parser. Express 5 changes the default query parser; repeated `categorySelection` values are part of the current behaviour and should be tested during migration.

## APIs and error handling

- No deprecated Express 4 APIs were found in the application source.
- Five route handlers are async: `getAllWords`, `postUpdateWord`, `getWord`, `postCreateNewWord`, and `postDeleteWord`. They do not use an explicit async wrapper. Expected API errors are mostly caught inside the handlers.
- The custom CSRF error handler renders CSRF failures and forwards other errors. There is no custom general error handler; other errors use Express's default handler.

## Middleware and package compatibility

- Middleware order: static files, structured logging, Helmet, URL-encoded parsing, cookie parsing, session, CSRF, authentication, routes, CSRF error handler, and not-found handler.
- Installed Companies House package versions are `node-session-handler` 5.2.23, `web-security-node` 4.4.33, and `structured-logging-node` 2.0.16.
- The session package's development dependencies use Express 4. The security package's development dependencies use Express 5. Neither declares an Express peer version. Verify the complete middleware stack at runtime after upgrading.

## Tests and coverage

- Controller tests cover rendering, redirects, errors, and single or repeated category selections. Authentication, CSRF handling, and health-check tests are present.
- The router test is a pending placeholder. No application-level HTTP or `supertest` tests were found, and `package.json` has no separate integration-test script.
- The existing `coverage/lcov.info` snapshot reports 365/380 lines (96.1%), 48/49 functions (98.0%), and 152/162 branches (93.8%). Its age is unknown; tests were not run during Discovery.
