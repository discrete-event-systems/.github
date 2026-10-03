# Bounded formal-verification gate

This dependency-free Node.js runner executes the pinned DES Rust checker over a deterministic set of versioned JSON models. It is a CI boundary, not a new model language or a replacement for the checker.

## What changed

The previous inline Python wrapper materialized an entire recursive glob before checking limits, followed directory symlinks, buffered unbounded child output, and had no checker-specific execution timeout. The replacement bounds traversal as it proceeds, rejects symlinks, bounds file reads and process output, and records the exact bytes supplied to the checker.

The workflow checks out both checker and runner at full immutable commit SHAs, verifies those revisions, and builds a clean archive of the checker outside the caller's directory hierarchy. This prevents a caller Cargo workspace or `.cargo/config.toml` from silently changing the checker build. Its Rust toolchain is pinned to the version used by the checker's passing CI. The caller's actual checkout SHA is recorded independently from the helper revisions.

## Supported inputs and limits

Use a relative POSIX glob ending in `.json`. Literal components, `*`, `?`, and whole-component `**` are supported; `**` matches zero or more directories. Absolute paths, `..`, backslashes, control characters, character classes, brace expansion, and partially embedded `**` are rejected. Narrow the glob to `formal/` rather than selecting helper source.

Production bounds are 250 files, 4,000,000 bytes per file, 20,000,000 aggregate input bytes, 10,000 inspected directory entries, 64 traversed directory levels, 1,000,000 captured stdout/stderr bytes, and a 120-second checker execution deadline. The existing overall GitHub job timeout remains in place. These are resource limits, not proof bounds; the separate `max_states` parameter accepts integers from 1 through 100,000.

The workflow deliberately runs on Linux. Reads use `O_NOFOLLOW`, `O_NONBLOCK`, regular-file checks, bounded buffers, fatal UTF-8 decoding, and descriptor-path containment checks under `/proc/self/fd`. Matching file and directory symlinks are rejected even when they resolve inside the workspace. Caller model files are never modified. Only invocation-owned temporary snapshots are cleaned up.

## Evidence and outcomes

Each selected file is copied byte-for-byte into a private temporary directory. SHA-256 is calculated from those same bytes, not a separately re-read pathname or JSON reserialization. The checker receives the snapshots as arguments after `--`, without shell expansion. This is a raw-byte evidence hash, not JCS canonicalization or an `ores.formal-interchange.v1` conformance claim.

The evidence object has schema `des.formal-gate.evidence.v2` and profile
`organization-baseline-v1`. It records caller/checker/runner revisions, model paths
and exact-byte hashes, the state bound, the built checker binary's SHA-256 and byte
size, and hashes/byte counts of captured stdout and stderr, plus one of:

- `PASS` / exit 0: the pinned checker returned success with nonempty evidence;
- `COUNTEREXAMPLE` / exit 1: the checker rejected a well-formed model;
- `ERROR` / exit 2: malformed input or an execution error, including timeout, excessive output, unexpected exit status, signal, or empty success output.

Preflight errors fail with exit 2 before execution. They may not have a completed evidence manifest. The job summary uses indented JSON rather than interpreting model-provided Markdown. Workflow command parsing is suspended while printing checker output. A successful result remains **model-only**: implementation conformance, exact-real arithmetic, and fairness-based termination have not been proved. The organization profile invokes the checker with `--strict`: zero-invariant models, explicitly disabled baseline checks, unreachable-state drift, and vacuous conditional invariants fail closed rather than producing green warning-only evidence.

## Tests

```sh
node --check tools/formal-gate/runner.mjs
node --test tools/formal-gate/runner.test.mjs
```

Local tests cover grammar, immutable production ceilings, deterministic traversal,
empty selection, symlink escapes/cycles, bounded reads, UTF-8, snapshot and binary
hashes, exit semantics, process-tree cleanup, execution deadlines, output caps, and
absent evidence. Native controls additionally use the actual Rust executable:

```sh
DES_REQUIRE_NATIVE_CHECKER=1 \
DES_FORMAL_CHECKER_PATH=/absolute/path/to/des-formal-check \
node --test tools/formal-gate/runner.test.mjs
```

The reusable CI workflow sets both variables and requires all 26 tests, including real success, safety failure, malformed JSON, duplicate states, precision regression, overflowing integers, and missing guard inputs. The native tests are explicitly skipped only in a local invocation without that executable; missing CI configuration is an error.

## Review order

This change is stacked on `.github#17` and depends on `des-mcp-server.rs#35`, itself stacked on #28. Accept the checker correction into #28 before approving the initial checker. Accept this gate correction into #17 before approving the initial reusable gate. Re-check final merge results and deliberately repin helpers after review; branch deletion or squash merging must not be assumed to preserve ancestry of the pinned commits.


## Process and policy hardening

Production limits are immutable ceilings: test helpers may tighten them but cannot
raise or disable them. The Linux runner starts the checker in its own process group
and kills that entire group on timeout, output overflow, and normal completion so
orphaned descendants cannot escape the gate's resource boundary.

The organization gate always invokes `des-formal-check --strict`. The generic
checker remains available outside the reusable organization workflow for exploratory
models, but permissive settings are never promoted to organization-baseline PASS
evidence.
