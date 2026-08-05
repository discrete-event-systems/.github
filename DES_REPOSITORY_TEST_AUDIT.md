# DES repository and test-organization audit

Audit date: 2026-08-05

## Production repository inventory

Present:

- `des-web.rs`
- `des-mcp-server.rs`
- `discrete-event-systems.github.io`
- `.github`

Required by `DES_REPOSITORY_ARCHITECTURE.md` but not yet present:

- `des-interfaces`
- `des-lib`
- `des-clients`
- `des-cli`
- `des-api-server.rs`
- `des-infra`
- `des-monorepo`

The missing repositories must be created in `discrete-event-systems`, initialized with `main`, standard community files, CI, `.zpkg.toml`, and `.zpkg.lock` where dependencies exist.

## Test organization inventory

Present in `discrete-event-systems-test`:

- `des-web-playwright-e2e`
- `des-web-puppeteer-e2e`
- `.github`

Required additions:

- `des-web-selenium-e2e`
- `des-api-contract-e2e`
- `des-cli-e2e`
- `des-mcp-server-e2e`
- `des-monorepo-integration-e2e`
- `des-zpkg-integration-e2e`

## Coverage contract

Every production `des-*` repository must have:

1. pull-request CI for formatting, linting, unit tests, dependency/license audit, and build;
2. at least one cross-repository integration suite in `discrete-event-systems-test`;
3. a scheduled test against the default branch;
4. artifact retention for logs and browser traces on failure;
5. a documented mapping from production repository to test repositories;
6. no production credentials in test repositories;
7. compatibility with GitHub-hosted runners and `gha-indie-worker` runners.

## Repository-to-test mapping

| Production repository | Test repository or suite |
|---|---|
| `des-web.rs` | `des-web-playwright-e2e`, `des-web-puppeteer-e2e`, planned `des-web-selenium-e2e` |
| `des-mcp-server.rs` | planned `des-mcp-server-e2e` |
| `des-api-server.rs` | planned `des-api-contract-e2e` |
| `des-cli` | planned `des-cli-e2e` |
| `des-monorepo` | planned `des-monorepo-integration-e2e` |
| `des-interfaces`, `des-lib`, `des-clients`, `des-infra` | planned `des-zpkg-integration-e2e` plus repository-local CI |

## Completion gate

This audit is complete only when all required production repositories exist, all planned test repositories exist, their default branches contain runnable CI, and the organization GitHub Project and Linear project link each repository to its implementation and test work items.
