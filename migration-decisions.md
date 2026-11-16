# Migration Decisions

## Discovery decisions

- Make no code or dependency changes during Discovery.
- Preserve the existing URL-encoded parser setting, `extended: true`, during migration.
- Test repeated `categorySelection` query values before choosing an Express 5 query-parser setting.
- Confirm session and CSRF middleware behaviour at runtime before treating the service as Express 5 compatible.
- No route-pattern changes are indicated by Discovery.
