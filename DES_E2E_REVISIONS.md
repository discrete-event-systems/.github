# DES E2E revision and interaction gate

This file documents the executable cross-repository E2E gate hosted temporarily in the organization `.github` repository until `discrete-event-systems/des-e2e` is provisioned.

## Active production repositories

- `discrete-event-systems/des-web.rs`
- `discrete-event-systems/des-mcp-server.rs`
- `discrete-event-systems/discrete-event-systems.github.io`

## Active test repositories

- `discrete-event-systems-test/des-web-playwright-e2e`
- `discrete-event-systems-test/des-web-puppeteer-e2e`

The orchestrator pins reusable browser suites to immutable commits:

- Playwright: `1e1116ef6811c4e3e6be34ad3e1def39bc20ef59`
- Puppeteer: `0547548429d937023a124de37afca7659a85c3dd`

## Active interaction matrix

| Producer | Consumer/test | Gate |
|---|---|---|
| `des-web.rs` | Rust crate/test graph | `cargo test --all-targets --locked` |
| `des-mcp-server.rs` | Rust crate/test graph | `cargo test --all-targets --locked` |
| `des-web.rs` fixture contract | Playwright test repo | reusable workflow |
| `des-web.rs` fixture contract | Puppeteer test repo | reusable workflow |
| production/test org inventory | orchestrator | `git ls-remote` |

## Repositories awaiting provisioning

Production:

- `des-e2e`
- `des-interfaces`
- `des-lib`
- `des-clients`
- `des-cli`
- `des-api-server.rs`
- `des-infra`
- `des-monorepo`

Test organization:

- `des-web-selenium-e2e`
- `des-api-contract-e2e`
- `des-cli-e2e`
- `des-mcp-server-e2e`
- `des-monorepo-integration-e2e`
- `des-zpkg-integration-e2e`

The workflow reports these as warnings instead of silently treating them as tested. When a repository appears, it must be promoted into the active interaction matrix before the release gate can claim coverage.

## Migration to `des-e2e`

When `discrete-event-systems/des-e2e` exists, move this workflow and revision manifest there. That repository should own service composition, PostgreSQL fixtures, API/CLI/MCP/browser contract orchestration, Zed package integration, submodule verification, deployment smoke tests, and retained evidence artifacts. The `.github` copy should then become a thin caller of the canonical `des-e2e` reusable workflow.
