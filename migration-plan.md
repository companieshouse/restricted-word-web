**Express 4 → Express 5 Migration Plan**
**Objective**
Upgrade this application from Express 4 to Express 5 and document all findings.

**Rules**
1. Always update this file as tasks progress.
2. Record findings in migration-report.md.
3. Record architectural decisions in migration-decisions.md.
4. Mark completed tasks with [x].
5. Add newly discovered tasks when necessary.
6. Do not delete completed tasks.
7. Do not commit any changes.
8. Do not go beyond the following task
9. All documentation must be simple and in a easy-to-read format.
10. Do not overwrite previous documentation when going through the phases - Discovery, Migration, Validation, Documentation. Ensure all phases are documented.

**Discovery**
1. [x] Determine current Express version
2. [x] Identify all Express-related packages
3. [x] Review routes and routers
4. [x] Record API responses and test coverage
5. [x] Identify deprecated Express 4 APIs
6. [x] Identify custom error handlers
7. [x] Identify async route handlers
8. [x] Identify middleware that may be affected
9. [x] Document findings in pre-migration.md

**Migration**
1. [x] Upgrade Express dependency
2. [x] Update deprecated APIs (none found)
3. [x] Update route matching syntax (no changes required)
4. [x] Update middleware (no changes required)
5. [x] Update async error handling (Express 5 forwards rejected handler promises)
6. [x] Preserve response behaviour
7. [x] Review and run the relevant existing tests; no test changes were needed

**Validation**
1. [x] Run linting
2. [x] Run unit tests
3. [ ] Run integration tests (no integration test script is defined)
4. [x] Run build
5. [ ] Verify application startup, API contracts, authentication, errors, uploads, security, and performance
6. [ ] Verify session and CSRF middleware and query parsing under Express 5
7. [x] Verify Express 5 rejected async promise forwarding with an HTTP smoke probe
8. [ ] Verify rejected async handlers through an application-level HTTP test

**Documentation**
1. Create migration-report.md
2. Document code changes
3. Document breaking changes
4. Create final migration summary


**Agent Responsibilities**
After every repository investigation:

- Update migration-report.md
- Update migration-plan.md
- Record any discovered blockers
- Record commands executed
- Record modified files
