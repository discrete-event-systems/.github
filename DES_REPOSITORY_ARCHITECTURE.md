# Discrete Event Systems repository architecture

The organization uses small repositories with one-way dependency boundaries. The existing `des-web.rs`, `des-mcp-server.rs`, and `discrete-event-systems.github.io` repositories remain authoritative; do not create another Rust web server.

## Repository set

| Repository | Responsibility |
|---|---|
| `des-interfaces` | Source-of-truth schemas, OpenAPI, protocol definitions, and generated contract bindings. |
| `des-lib` | Reusable deterministic simulation primitives. |
| `des-clients` | Polyglot SDK fleet under `clients/`. |
| `des-cli` | Rust CLI powered by `flags-2-env`. |
| `des-api-server.rs` | Axum + SeaORM + PostgreSQL API server. |
| `des-infra` | Cloudflare Worker and deployment configuration, including `/des` prefix removal. |
| `des-monorepo` | Git-submodule composition workspace. |

## Monorepo composition

All component links live under `apps/`:

- `des-interfaces`
- `des-lib`
- `des-clients`
- `des-api-server.rs`
- `des-web.rs`
- `des-mcp-server.rs`
- `discrete-event-systems.github.io`

`des-cli` and `des-infra` are deliberately excluded from the monorepo and must not appear in `.gitmodules`.

## Client language matrix

`des-clients/clients` must contain C, C++, Zig, Gleam, Erlang, Elixir, Dart, Rust, Java, Go, Python 3, Ruby, PHP, TypeScript, Kotlin, and Swift. TypeScript has separate `core`, `nodejs`, `deno`, `bun`, and `edge` targets.

## CLI manifest compatibility

`.cli-args.toml` is the canonical DES CLI contract. The repository also maintains an exact generated `.cli-flags.toml` mirror because the standalone `flags2env` executable defaults to that filename. CI must fail when the files differ. Rust callers use the explicit `.cli-args.toml` path.
