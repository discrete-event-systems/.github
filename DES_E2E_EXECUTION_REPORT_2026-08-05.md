# DES E2E execution report — 2026-08-05

## Requested topology

The canonical orchestration repository is intended to be `discrete-event-systems/des-e2e`, with specialized execution repositories under `discrete-event-systems-test`.

## Repository availability

### Production organization

Available:

- `des-web.rs`
- `des-mcp-server.rs`
- `discrete-event-systems.github.io`
- `.github`

Unavailable:

- `des-e2e`
- `des-interfaces`
- `des-lib`
- `des-clients`
- `des-cli`
- `des-api-server.rs`
- `des-infra`
- `des-monorepo`

### Test organization

Available:

- `des-web-playwright-e2e`
- `des-web-puppeteer-e2e`
- `.github`

Unavailable:

- `des-web-selenium-e2e`
- `des-api-contract-e2e`
- `des-cli-e2e`
- `des-mcp-server-e2e`
- `des-monorepo-integration-e2e`
- `des-zpkg-integration-e2e`

## Executed evidence

- `des-web.rs` CI completed successfully on the latest audited main-branch commit.
- `des-web.rs` external browser fleet completed successfully and invoked immutable reusable workflows from both test repositories.
- `des-web-playwright-e2e` latest available CI completed successfully.
- `des-web-puppeteer-e2e` latest main-branch CI completed successfully.
- `des-mcp-server.rs` latest main-branch CI completed successfully.

## Interaction coverage proven

The currently available evidence proves:

1. `des-web.rs` can build and execute its first-party CI.
2. `des-web.rs` can invoke the Playwright and Puppeteer repositories across organizations using pinned workflow revisions.
3. Both browser suites can exercise the published DES web fixture and return passing results.
4. `des-mcp-server.rs` builds and passes its repository-local CI.

## Interaction coverage not yet possible

No complete DES-system interaction test can run until `des-e2e` and the missing component repositories exist. In particular, the following paths remain unproven:

- interfaces → lib compatibility
- interfaces → generated clients compatibility
- clients → API server contracts
- CLI → API server behavior
- API server → PostgreSQL/SeaORM integration
- web → API server integration
- MCP server → interfaces/lib integration
- monorepo submodule composition
- zed package resolution across the fleet
- infrastructure deployment and route behavior

## Required `des-e2e` responsibilities

Once created, `des-e2e` should:

- pin every production and test repository revision in a machine-readable manifest;
- dispatch reusable workflows in `discrete-event-systems-test`;
- stand up PostgreSQL and all DES services with health/readiness gates;
- run contract, CLI, SDK, browser, MCP, packaging, and deployment-smoke stages;
- upload JUnit, logs, traces, screenshots, videos, and revision manifests;
- run on Linux in GitHub-hosted Actions and on Linux/macOS/Windows through `gha-indie-worker` where supported;
- fail closed when any expected repository or required test workflow is missing.

## Release gate

The DES fleet is not fully E2E-qualified until all missing repositories exist and a green `des-e2e` run records immutable commit SHAs for every component and test repository.
