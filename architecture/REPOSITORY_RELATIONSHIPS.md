# `discrete-event-systems` repository relationships

Generated from reviewed policy and the current **public** repository inventory.

- Public repositories declared: **4**
- Private repository names withheld: **0**
- Relationship edges: **6**

## Repository roles

| Repository | Role | Lifecycle |
|---|---|---|
| [`.github`](https://github.com/discrete-event-systems/.github) | `organization_governance` | `active` |
| [`des-mcp-server.rs`](https://github.com/discrete-event-systems/des-mcp-server.rs) | `mcp_server` | `active` |
| [`discrete-event-systems.github.io`](https://github.com/discrete-event-systems/discrete-event-systems.github.io) | `site` | `active` |
| [`des-web.rs`](https://github.com/discrete-event-systems/des-web.rs) | `library` | `active` |

## Declared edges

| From | Relationship | To | Status/basis |
|---|---|---|---|
| `discrete-event-systems/.github` | `governs` | `discrete-event-systems/des-mcp-server.rs` | `inferred` / `role-convention`: organization defaults, safety, and relationship declarations |
| `discrete-event-systems/.github` | `governs` | `discrete-event-systems/des-web.rs` | `inferred` / `role-convention`: organization defaults, safety, and relationship declarations |
| `discrete-event-systems/.github` | `governs` | `discrete-event-systems/discrete-event-systems.github.io` | `inferred` / `role-convention`: organization defaults, safety, and relationship declarations |
| `organization://discrete-event-systems` | `deployed_via` | `platform://ORESoftware/k8s-cluster` | `platform-default` / `platform-policy`: immutable artifacts are promoted by digest through GitOps |
| `organization://discrete-event-systems` | `uses_transport_library` | `platform://ORESoftware/mcp-rust-libs` | `platform-default` / `platform-policy`: shared MCP transport and protocol hardening |
| `organization://discrete-event-systems` | `packaged_via` | `platform://zed-pkg` | `platform-default` / `platform-policy`: Zed resolves artifacts while submodules compose editable source |

## Composition, service, and observability contract

Git submodules compose editable source; Zed packages resolve packages/artifacts; dual-managed commits must match. Production deploys immutable image digests, not runtime source builds. Cross-service access uses APIs/SDKs/events rather than another service database. MCP uses the product API/SDK. Services emit OpenTelemetry traces, bounded metrics, and correlated structured logs.

## Privacy boundary

This public registry deliberately omits private repository names and edges; the count above makes the boundary explicit.
