# Formal verification policy

Formal methods in the `discrete-event-systems` organization are used to make critical state-machine behavior explicit, exhaustively check finite abstractions, and preserve counterexamples as executable regression evidence.

They complement implementation tests; they do not replace them. A model-check result proves obligations about the checked abstraction at the recorded revision and bound. It does not prove that arbitrary implementation code conforms to that abstraction unless conformance is separately tested.

## Required use cases

Repositories should add a formal model when a defect in any of these areas could create silent corruption, duplicate ownership, authorization bypass, unrecoverable workflow state, or distributed coordination failure:

- locks, leases, fencing tokens, and leader ownership;
- schedulers, queues, retries, cancellation, and terminal job states;
- authentication, authorization, session revocation, and capability lifecycles;
- payment, ledger, settlement, and idempotency workflows;
- protocol handshakes, connection lifecycles, and recovery paths;
- controllers whose correctness depends on event ordering or concurrency.

A small model of the consequential behavior is preferred over a broad but weak model of an entire application.

## Minimum proof obligations

Every model must state its assumptions and encode the properties relevant to its failure class. The organization baseline checks:

1. **Safety invariants.** Bad states are unreachable—for example, no lease has two owners and completed work never exceeds total work.
2. **Deterministic event selection.** A reachable `(state, event)` pair does not silently choose multiple destinations unless nondeterminism is explicitly modeled by distinct events.
3. **Deadlock freedom for active states.** A reachable non-terminal state has at least one outgoing transition.
4. **Terminal reachability.** Every reachable state retains at least one path to a declared terminal state.

Terminal reachability is existential. It does not establish fairness or prove that every execution eventually terminates. Fairness, probabilistic guarantees, unbounded data, and real-time behavior require an additional method such as TLA+/PlusCal, a theorem prover, deterministic schedule exploration, or domain-specific analysis.

## Model-to-implementation conformance

An executable model is useful only while it remains connected to production code. Each adopting repository must add tests or generated evidence that:

- enumerate the implementation's public states and events;
- reject implementation transitions that the model does not permit;
- verify modeled terminal states and error states match implementation semantics;
- replay counterexample traces against the implementation where practical;
- record the exact implementation and model commit checked;
- document abstractions, omitted state, environmental assumptions, and fairness assumptions.

A passing model with missing conformance evidence must be described as **model-verified**, not **implementation-verified**.

## Repository layout

Use version-controlled JSON models under `formal/`:

```text
formal/
  README.md
  models/
    lease.json
    scheduler.json
  evidence/
    README.md
```

Do not commit generated dependency caches, private production traces, credentials, customer data, or secrets as model fixtures. Reduce production incidents to synthetic, non-sensitive counterexample traces.

## CI adoption

After this repository's reusable workflow is merged, an adopting repository should call it by a full commit SHA:

```yaml
name: formal-model-check

on:
  pull_request:
    paths:
      - "formal/**/*.json"
      - ".github/workflows/formal-model-check.yml"
  push:
    branches: [main]
    paths:
      - "formal/**/*.json"
      - ".github/workflows/formal-model-check.yml"

permissions:
  contents: read

jobs:
  check:
    uses: discrete-event-systems/.github/.github/workflows/reusable-formal-model-check.yml@<FULL_COMMIT_SHA>
    with:
      model_glob: "formal/**/*.json"
      max_states: 10000
```

Never pin a reusable workflow to `main`, a tag, or another movable reference. Review and update the full SHA deliberately when the checker changes.

## Review evidence

A formal-model pull request should report:

- the failure class being excluded;
- safety and progress properties encoded;
- declared and reachable state counts;
- configured state bound;
- shortest counterexamples observed before the implementation fix;
- conformance tests and exact-head CI evidence;
- assumptions and behaviors outside the model.

Do not weaken or disable an obligation merely to make CI pass. A property may be narrowed only when the revised assumption is explicit, reviewed, and supported by implementation evidence.

## Checker upgrades

The reusable workflow pins the checker source to an immutable commit. Upgrades require a pull request that:

1. updates the checker commit SHA;
2. runs the organization sample model;
3. documents semantic changes and compatibility risks;
4. preserves stable exit semantics (`0` pass, `1` counterexample, `2` invalid input);
5. verifies that malformed or absent model input fails closed.
