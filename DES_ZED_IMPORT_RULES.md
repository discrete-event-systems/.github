# DES Zed package import rules

The dependency graph is acyclic and points inward toward contracts.

| Consumer | Required Zed dependencies |
|---|---|
| `des-interfaces` | none |
| `des-lib` | `discrete-event-systems/des-interfaces` |
| `des-clients` | `discrete-event-systems/des-lib`, `discrete-event-systems/des-interfaces` |
| `des-cli` | `des-clients`, `des-lib`, `des-interfaces`, `oresoftware/flags-2-env` |
| `des-api-server.rs` | `des-lib`, `des-interfaces` |
| `des-web.rs` | `des-lib`, `des-interfaces` |
| `des-mcp-server.rs` | `des-clients`, `des-lib`, `des-interfaces`, `des-cli` |
| `des-infra` | none |
| `des-monorepo` | no runtime dependencies; composition is through Git submodules |

## Boundary policy

1. `des-interfaces` is the source of truth for contracts and generated shapes.
2. `des-lib` owns reusable behavior but no transport-specific SDK code.
3. `des-clients` may consume contracts and library behavior but never servers.
4. Servers may consume interfaces and libraries but never CLI or infrastructure.
5. `des-cli` may orchestrate clients and libraries and must use `flags-2-env` for flag parsing.
6. `des-infra` owns routing and deployment only.
7. `des-monorepo` must not import packages through `.zpkg.toml`; Git submodules are its composition mechanism.
