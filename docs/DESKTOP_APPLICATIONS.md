# Desktop application allocation

Verified **2026-08-05**.

Discrete Event Systems is a **strong candidate** for a paired native desktop modeling and simulation workbench:

- Rust: [`discrete-event-systems/des-desktop.rs`](https://github.com/discrete-event-systems/des-desktop.rs) — **proposed**, not yet verified as a published repository.
- Flutter: [`discrete-event-systems/des-flutter`](https://github.com/discrete-event-systems/des-flutter) — **proposed**, not yet verified as a published repository.

These names are proposed allocation targets, not proof that either remote exists and not a claim that implementation is approved or complete. Promote the pair from proposed to planned only when scope, ownership, milestones, and repository creation are accepted in Linear.

## Product boundary

The pair should cover semantic parity for model and event-graph editing, scenario parameters, batch runs, deterministic seeds and replay, timelines, state inspection, result comparison, visualization, experiment bundles, local datasets, import/export, offline execution, and failure recovery.

A shared Rust simulation engine may sit behind an explicit library, FFI, or service boundary, but the Flutter application remains independently buildable, testable, and releasable. Shared schemas, model formats, run manifests, fixtures, seeds, golden results, and conformance tests should be versioned deliberately.

## Feature-delivery rule

Once planned, every desktop-facing change must inspect both implementations, define shared acceptance criteria, update both or record an explicit no-change rationale, and report Rust and Flutter status separately.

## Project routing

- GitHub Project: [`discrete-event-systems-project` — Project 1](https://github.com/orgs/discrete-event-systems/projects/1)
- Linear project: `github.com/discrete-event-systems`
- Central registry: [`approved-private-registry`](private-registry://canonical/registry/desktop-applications.json)
- Portfolio rollout: [`DEN-2469`](https://linear.app/denman/issue/DEN-2469/roll-out-paired-rust-flutter-desktop-repositories-across-the-portfolio)

Promotion, repository creation, renames, transfers, archival, or platform-status changes must update this document, Linear, the central registry, and both companion repositories together.
