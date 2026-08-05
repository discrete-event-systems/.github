<!-- ore-org-baseline:begin -->
# Repository relationships for `discrete-event-systems`

This file is rendered from `repository-relationships.json`. The JSON registry is authoritative.

- Audience: `public`
- Repositories represented: **4**
- Relationships represented: **4**
- Inventory digest: `sha256:6eaeaa131805488503d40dfa9219819fe153b03bf25fe287f0cd85bb3f2e1235`

## Immutable routing identity

| Field | Value |
|---|---|
| Mapping ID | `context:discrete-event-systems` |
| GitHub owner ID | `306297904` |
| Linear project ID | `b352c0c6-02f5-4a5a-8460-017aedb5352f` |
| Linear team ID | `eb8ab169-5afe-4b6f-9cab-3f2aa3e887dc` |

## Repositories

| Repository | Visibility | Roles | Archived |
|---|---|---|---|
| `discrete-event-systems/.github` | `public` | `community-health`, `governance`, `relationship-registry` | no |
| `discrete-event-systems/des-mcp-server.rs` | `public` | `mcp-server` | no |
| `discrete-event-systems/des-web.rs` | `public` | `repository` | no |
| `discrete-event-systems/discrete-event-systems.github.io` | `public` | `documentation-site` | no |

## Relationships

| From | Type | To | Status | Required |
|---|---|---|---|---|
| `discrete-event-systems/.github` | `governs` | `discrete-event-systems/des-mcp-server.rs` | `declared` | yes |
| `discrete-event-systems/.github` | `governs` | `discrete-event-systems/des-web.rs` | `declared` | yes |
| `discrete-event-systems/.github` | `governs` | `discrete-event-systems/discrete-event-systems.github.io` | `declared` | yes |
| `discrete-event-systems/discrete-event-systems.github.io` | `documents` | `discrete-event-systems/.github` | `inferred` | no |

## Editing relationships

Put reviewed public declarations in `repository-relationships.manual.json`; do not edit the generated registry directly.
Private repository names and private-only relationships belong in the private `ORESoftware/project-registry` mirror.
Inferred edges are advisory and must remain visibly labeled until reviewed.
<!-- ore-org-baseline:end -->
