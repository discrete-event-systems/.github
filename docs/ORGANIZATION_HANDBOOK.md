# discrete-event-systems organization handbook

> Shared operating defaults for repositories maintained under **discrete-event-systems**. Repository-local policy may strengthen these rules but should not silently weaken them.

## Mission

discrete-event-systems maintains discrete-event simulation engines, models, interfaces, clients, services, infrastructure, and educational material. This `.github` repository is the canonical home for shared policy, reusable templates, community health files, and planning links.

## Repository contract

Each active repository must document purpose, ownership, maturity, supported languages and environments, development and test commands, authoritative event/model/interface formats, release and rollback procedures, compatibility policy, and GitHub Project/Linear links. Simulation components should also document clock and event-order semantics, tie-breaking, random seeds, determinism, units, model assumptions, queue behavior, cancellation, persistence, performance limits, and validation boundaries.

## Change workflow

1. Anchor work in an issue, Linear item, or documented maintenance objective.
2. Keep branches and pull requests focused.
3. Explain motivation, model and compatibility impact, scope, validation, migration, and rollback.
4. Test empty, simultaneous, reordered, cancelled, long-running, replayed, persisted, invalid, and high-volume scenarios as relevant.
5. Resolve conflicts semantically by reconstructing both sides' intent.
6. Prefer squash merges for focused work unless commit structure materially improves auditability.

## Evidence, security, and documentation

Pull requests should include reproducible commands, deterministic fixtures and seeds, expected and observed event traces, baseline comparisons, performance and negative-path evidence, documentation updates, and CI or local-equivalent results. Never commit credentials, private datasets, proprietary scenarios, or sensitive logs. Follow `SECURITY.md` for private reporting. Keep event semantics, units, assumptions, tolerances, compatibility, and important model and operational decisions explicit.

## Planning ownership

GitHub owns code, reviews, checks, releases, and delivery evidence. Linear owns priority, dependencies, sequencing, and cross-project planning. The organization GitHub Project is the cross-repository execution view; see `PROJECTS.md` for routing details.

## Organization health

- [ ] Profiles, descriptions, topics, and READMEs are current.
- [ ] Community health files and reusable issue/PR guidance are present.
- [ ] Clock, event order, ties, seeds, units, cancellation, persistence, limits, and validation are documented.
- [ ] Required checks cover deterministic replay, boundaries, high volume, compatibility, performance, and supply-chain risk.
- [ ] Stale repositories are archived or clearly marked.
- [ ] GitHub Project and Linear links resolve and reflect completed work.
