# discrete-event-systems organization defaults

This public `.github` repository contains organization-wide community health files, contributor guidance, shared agent policy, an explicit repository-relationship contract, and project/planning routing.

- [Project and Linear routing](PROJECTS.md)
- [Governance](GOVERNANCE.md)
- [Repository boundaries](REPOSITORY_BOUNDARIES.md)
- [Branching and deployment](BRANCHING_AND_DEPLOYMENT.md)

Repository-local policy wins when it is stricter or more specific. Existing project history must be preserved during consolidation and conflict resolution.

<!-- ore-org-baseline:begin -->
## Account-wide defaults

This public repository is the canonical source for GitHub-supported fallback community files, organization profile content, reusable workflow examples, and public contributor guidance for [`discrete-event-systems`](https://github.com/discrete-event-systems).

- GitHub owner: [`discrete-event-systems`](https://github.com/discrete-event-systems)
- Linear project: [github.com/discrete-event-systems](https://linear.app/denman/project/githubcomdiscrete-event-systems-4a3086ae0c45)
- Public context: [`ORG_CONTEXT.md`](ORG_CONTEXT.md)
- Canonical agent policy for this repository: [`agents.md`](agents.md)
- Governance: [`GOVERNANCE.md`](GOVERNANCE.md)
- Public repository graph: [`repository-relationships.json`](repository-relationships.json)
- Relationship guide: [`docs/REPOSITORY_RELATIONSHIPS.md`](docs/REPOSITORY_RELATIONSHIPS.md)
- Security reporting: [`SECURITY.md`](SECURITY.md)

GitHub applies only its documented fallback community files automatically. Agent instructions, relationship files, and reusable workflows are **not copied into sibling repositories**; repositories that need local enforcement must carry their own lowercase `agents.md` and explicitly call or copy the provided workflow.

`repository-relationships.json` is generated from GitHub owner membership plus reviewed declarations in `repository-relationships.manual.json`. It is public-safe: private repository names are omitted. The complete graph is synchronized separately to the approved private project registry.

## Safety baseline

Changes are pull-request driven. Contributors and agents must preserve concurrent work, avoid destructive Git operations, resolve conflicts semantically with full history and cross-repository context, validate affected contracts, and never claim a remote action completed without authoritative evidence.

Generated baseline version: `2026-08-04`.
<!-- ore-org-baseline:end -->
