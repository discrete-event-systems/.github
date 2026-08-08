# Project and planning routing

This file defines the organization-level routing contract for work owned by `discrete-event-systems`.

## Canonical planning systems

- GitHub Project: [`discrete-event-systems-project`](https://github.com/orgs/discrete-event-systems/projects/1)
- Linear project: [`github.com/discrete-event-systems`](https://linear.app/denman/project/githubcomdiscrete-event-systems-4a3086ae0c45)
- Organization documentation: [`discrete-event-systems/.github`](https://github.com/discrete-event-systems/.github)
- Fleet registry/controller: [Linear DEN-2242](https://linear.app/denman/issue/DEN-2242/reconcile-github-projects-and-linear-documentation-across)

The GitHub Project URL is the canonical routing target recorded in the fleet registry. Project-item reconciliation is automated by DEN-2242. Its latest evidence run was rate-limited, so an issue must not be described as attached to the board until a successful project-item result is recorded. Repository issues and Linear remain the authoritative fallback during that verification window.

## DES browser automation fleet

Browser verification for the canonical DES web surface is intentionally split from the application repository and runs from more than one independently versioned repository in `discrete-event-systems-test`.

Planning and execution routing:

- Product browser-automation board: [discrete-event-systems Project 2](https://github.com/orgs/discrete-event-systems/projects/2)
- Test execution board: [discrete-event-systems-test Project 1](https://github.com/orgs/discrete-event-systems-test/projects/1)
- Test-org planning document: [discrete-event-systems-test/.github/docs/PROJECTS.md](https://github.com/discrete-event-systems-test/.github/blob/main/docs/PROJECTS.md)
- Linear product browser tracker: [DEN-2444](https://linear.app/denman/issue/DEN-2444)
- Linear cross-repository automation tracker: [DEN-2447](https://linear.app/denman/issue/DEN-2447)
- Linear exact-SHA indie-worker evidence: [DEN-2657](https://linear.app/denman/issue/DEN-2657)

Immutable test revisions:

| Repository | Driver | Exact revision | Hosted lane | Independent lane |
| --- | --- | --- | --- | --- |
| `discrete-event-systems-test/des-web-playwright-e2e` | Playwright | `1e1116ef6811c4e3e6be34ad3e1def39bc20ef59` | GitHub Actions | `gha-indie-worker` fixed `playwright` profile |
| `discrete-event-systems-test/des-web-puppeteer-e2e` | Puppeteer | `0547548429d937023a124de37afca7659a85c3dd` | GitHub Actions | `gha-indie-worker` fixed `puppeteer` profile |

The hosted GitHub Actions lane and `gha-indie-worker` lane are deliberately independent. The independent lane accepts only immutable commit SHAs and reviewed `.github/workflows/gha-indie-worker.yml` files. The `dd-build-server` remains unprivileged; exact DES browser profiles are delegated to the separately authenticated `dd-ci-profile-runner`, whose policy binds only the two repositories above to their fixed profiles. The runtime change is merged in `ORESoftware/k8s-cluster#1171` and was promoted to the Argo-tracked `dev` branch in `ORESoftware/k8s-cluster#1176`.

Protected execution also registers/resolves an `ai-agent-bridge` channel and posts the claimed lane, blockers, and completion result so parallel agents can avoid overlapping mutations. Live two-repository certification and retained build IDs remain recorded in DEN-2657 rather than inferred from deployment state.

## Canonical `/des` web delivery

### Application ownership

`discrete-event-systems/des-web.rs` owns pages, route taxonomy, browser and htmx behavior, API contracts, application tests, route documentation, and immutable image publication.

### GitOps ownership

`ORESoftware/k8s-cluster` owns Deployments, Services, PDBs, NetworkPolicies, gateway compatibility, Argo CD, image promotion, public rollout evidence, and rollback.

### Delivered implementation

- Application PR: [`des-web.rs#10`](https://github.com/discrete-event-systems/des-web.rs/pull/10)
  - merge commit: `e7d8b284dd796826bc09120bbd10295b0bf2783f`
- GitOps PR: [`k8s-cluster#872`](https://github.com/ORESoftware/k8s-cluster/pull/872)
  - merge commit: `7b77b48dcb347a0c474da1831e09f27338db43c1`
- GitOps delivery documentation: [`k8s-cluster#996`](https://github.com/ORESoftware/k8s-cluster/pull/996)
  - merge commit: `24e40c65b19d3673c7f5512aa76f9e82e082c430`
- DES delivery documentation: [`des-web.rs#13`](https://github.com/discrete-event-systems/des-web.rs/pull/13) and [`des-web.rs#14`](https://github.com/discrete-event-systems/des-web.rs/pull/14)
  - final merge commit: `360ddfd4a51dd2ecdd555c778e161985411ca16c`

Pinned image:

```text
ghcr.io/discrete-event-systems/des-web.rs:sha-77741ec8b5331617f71416748ef5f06846e43a5d@sha256:c3b32a5ef767bcdba515c8199fce363871ba2916e4c824609a09a37b3adc02e5
```

## Active work items

- GitHub application/organization tracker: [`des-web.rs#11`](https://github.com/discrete-event-systems/des-web.rs/issues/11)
- GitHub GitOps rollout tracker: [`k8s-cluster#991`](https://github.com/ORESoftware/k8s-cluster/issues/991)
- Linear completed implementation: [`DEN-1936`](https://linear.app/denman/issue/DEN-1936/des-webrsk8s-cluster-consolidate-public-des-pages-under-des)
- Linear active AWS/Hetzner rollout: [`DEN-2280`](https://linear.app/denman/issue/DEN-2280/k8s-clusterdes-webrs-verify-the-canonical-des-rollout-in-aws-and)
- Linear architecture document: [DES route consolidation and GitOps ownership](https://linear.app/denman/document/des-route-consolidation-and-gitops-ownership-dc64657c976f)

The remaining operational gates are AWS and Hetzner Argo CD synchronization, public route/probe/engine/degraded-mode verification, compatibility-traffic observation, and rollback evidence.

## Independent infrastructure issue

The private `remote/libs` authentication failure in repository-wide `k8s-cluster` jobs is independent of the focused DES route contract and rendered manifests. It is tracked in [`k8s-cluster#997`](https://github.com/ORESoftware/k8s-cluster/issues/997) and [Linear DEN-2284](https://linear.app/denman/issue/DEN-2284/k8s-ci-rotate-the-dedicated-remotelibs-deploy-key-and-restore-required).

## Update rules

1. Every material cross-repository delivery must link its application PR, GitOps PR, GitHub tracker, Linear issue, validation evidence, and rollback plan.
2. Exact source SHAs and immutable image digests must be preserved in the records.
3. Implementation completion and live deployment verification must remain separate states.
4. Compatibility routes may be removed only after request evidence is recorded.
5. GitHub Project attachment must be verified from project-item evidence rather than inferred from the existence of the board URL.
