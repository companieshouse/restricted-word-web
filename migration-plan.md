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
1. [] Upgrade Express dependency
2. [] Update deprecated APIs
3. [] Update route matching syntax
4. [] Update middleware
5. [] Update async error handling
6. [] Preserve response behaviour
7. [] Review and run the relevant existing tests; no test changes were needed

**Validation**
1. [ ] Run linting
2. [ ] Run unit tests
3. [ ] Run integration tests
4. [ ] Run build
5. [ ] Verify application startup, API contracts, authentication, errors, uploads, security, and performance
6. [ ] Verify session and CSRF middleware and query parsing under Express 5
7. [ ] Verify rejected async handlers through HTTP-level tests

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
