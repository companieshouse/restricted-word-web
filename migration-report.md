# Express 5 Migration Report

## Phase status

- Discovery: complete.
- Migration: not started.
- Validation: not started.
- Final migration summary: not started.

## Discovery findings

- The app requests Express `^4.22.2` and `@types/express` `~4.17.25`; installed versions are 4.22.3 and 4.17.25.
- App routes use standard Express patterns. No deprecated Express APIs or legacy route patterns were found.
- Five async controller handlers are not wrapped explicitly. Express 5 forwards rejected handler promises to error middleware.
- The app has a CSRF-specific error handler, but no general error handler.
- Express 5 changes the default query parser. Repeated `categorySelection` values are used and need a regression check.
- Session and CSRF middleware come from third-party Companies House packages. Their Express 5 runtime compatibility must be verified.
- Unit tests cover controller behaviour, authentication, CSRF handling, and health checks. HTTP-level route tests are absent.

## Commands run

- `git status --short` — found a modified `package-lock.json`; it was left unchanged during Discovery.
- `npm ls express @types/express body-parser cookie-parser helmet --depth=0` — passed; Express 4.22.3, types 4.17.25, and Helmet 3.23.3 are installed.
- `npm ls express-async-handler body-parser --all` — found `express-async-handler` 1.2.0 under the session and security packages, and `body-parser` 1.20.9 under Express.
- `awk` over `coverage/lcov.info` — read the existing coverage snapshot; no tests were run.
- Source and test searches — reviewed routes, responses, middleware, error handlers, async handlers, and test coverage.

## Files changed in Discovery

- `migration-plan.md` — marked Discovery tasks complete.
- `pre-migration.md` — recorded the discovery findings.
- `migration-report.md` — recorded phase status, findings, commands, and blockers.
- `migration-decisions.md` — recorded discovery decisions.

No application code, dependencies, or lockfile were changed during Discovery.

## Blockers to address later

- HTTP-level route and async error-propagation tests are absent.
- Session and CSRF middleware compatibility with Express 5 is unverified.
- Query parsing for repeated category filters needs a regression test.
