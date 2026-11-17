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

## Migration Phase - 2026-11-16

### Changes

- Upgraded only `express` to `^5.3.0` and `@types/express` to `^5.0.6`.
- Set the query parser to `extended` to preserve Express 4 query parsing behaviour.
- Narrowed `request.params.wordId` to a string for the fixed `/word/:wordId` route, as Express 5 types permit string arrays for route parameters.
- No deprecated APIs, route pattern rewrites, or other middleware changes were needed. Existing async handlers rely on Express 5 promise rejection forwarding.
- No test source changes were needed; existing tests cover word rendering and single/repeated category filters.

### Commands and results

- `npm install express@^5.3.0 --save && npm install @types/express@^5.0.6 --save-dev` — upgraded the runtime and types. npm reported 19 audit findings (1 low, 16 moderate, 2 high); those findings are outside this migration phase.
- `npm run build:compile` — first run identified the `request.params.wordId` type mismatch; passed after narrowing the route parameter.
- `npm test -- --grep 'getWord|handles selecting a single category correctly|handles selecting multiple cateogories correctly'` — passed, 7 tests.
- `npm ls express @types/express --depth=0` — passed with Express 5.3.0 and types 5.0.6.
- `git diff -- package.json` — confirmed only the Express runtime and type versions changed in the manifest.

### Files changed

- `package.json` and `package-lock.json` — upgraded Express and its types; the lockfile had pre-existing changes and was preserved.
- `src/app.ts` — preserved the extended query parser.
- `src/controllers/RestrictedWordController.ts` — narrowed the `wordId` route parameter type.
- `migration-plan.md`, `migration-report.md`, and `migration-decisions.md` — recorded migration progress without replacing Discovery notes.

Migration is complete. Validation remains outstanding.

## Validation Phase - 2026-11-17

### Results

- `npm run lint` — passed.
- `npm test` — 95 passed, 2 pending. The pending tests are the API error case and router placeholder.
- `npm run build` — passed. Sass and GOV.UK Frontend emitted deprecation warnings.
- `npm run test:integration` — unavailable; npm reports that the script is not defined.
- The app started on a local validation port after supplying required environment variables and a cookie secret of at least 24 characters.
- `GET /admin/restricted-word/healthcheck` returned `200 OK` with Helmet response headers.
- Unauthenticated `GET /admin/restricted-word/` returned `302` to the sign-in URL.
- `POST /admin/restricted-word/update` without a session/CSRF token returned `403`. Valid-session behaviour was not tested.
- Express 5's default query parser returned repeated `categorySelection` values as an array. Bracketed keys were exposed under the literal `categorySelection[]` key. The app generates repeated unbracketed keys; nested query compatibility remains unverified.
- An isolated Express 5 HTTP probe confirmed a rejected async route promise reached error middleware and returned `500`. This did not exercise an application controller route.
- Redis on port 6379 and a local API port on 4001 were reachable, but authenticated upstream API contracts were not exercised.

### Remaining checks and blockers

- No integration-test script or application-level HTTP test suite is available.
- A valid session and CSRF token flow, authenticated upstream API contracts, and application-route async rejection handling remain unverified.
- The app has no upload route identified in Discovery; upload verification is not applicable to its current routes.
- Performance under a representative workload was not measured.

### Commands run

- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:integration` — unavailable script.
- `npm start` with local validation environment variables; first attempt used a too-short test cookie secret and failed, then succeeded with a 24+ character value.
- `curl` requests for health check, unauthenticated page access, and a POST without a CSRF token.
- `node -e` HTTP probes for Express 5 query parsing and rejected async handler forwarding.

### Files changed during Validation

- `migration-plan.md` — marked lint, unit tests, build, and the isolated async forwarding probe complete; recorded integration and application-level checks still open.
- `migration-report.md` — appended validation results, commands, and blockers.

The temporary application server was stopped. Full Validation is not complete.
