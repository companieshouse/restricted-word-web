# Migration Decisions

## Discovery decisions

- Make no code or dependency changes during Discovery.
- Preserve the existing URL-encoded parser setting, `extended: true`, during migration.
- Test repeated `categorySelection` query values before choosing an Express 5 query-parser setting.
- Confirm session and CSRF middleware behaviour at runtime before treating the service as Express 5 compatible.
- No route-pattern changes are indicated by Discovery.

## Migration decisions

- Keep the dependency upgrade limited to Express and `@types/express`; do not change unrelated dependencies or overrides.
- Set the query parser to `extended` to retain Express 4 query parsing behaviour. -- Removed by me: I don’t see the app generating that syntax, so setting extended preserves Express 4 semantics defensively;it doesn’t appear necessary for the query strings the app currently generates.
- Narrow the `wordId` parameter to a string because its route defines one named path segment.
- Do not add an async wrapper; Express 5 forwards rejected route-handler promises to error middleware.
- Do not rewrite routes or middleware where Discovery found no incompatibility.
- Keep full lint, unit, integration, build, startup, and middleware checks in the Validation phase.
