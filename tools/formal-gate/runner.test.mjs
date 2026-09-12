import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { parseStateBound, parsePattern, matches, discoverModels, runProcess, runGate } from './runner.mjs';

async function workspace(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'formal-gate-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}

async function write(root, name, bytes = '{}') {
  const destination = path.join(root, name);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, bytes, { flag: 'wx' });
  return destination;
}

async function checker(root, body) {
  const destination = await write(root, 'mock-checker.mjs', `#!${process.execPath}\n${body}\n`);
  await fs.chmod(destination, 0o700);
  return destination;
}

function gate(root, executable, extra = {}) {
  return runGate({ root, checker: executable, pattern: 'formal/**/*.json', maxStates: '1000', ...extra });
}

const positive = JSON.stringify({
  $schema: 'des/state-machine/v1', name: 'lease', initial: 'free',
  states: { free: { owners: 0 }, held: { owners: 1 }, released: { owners: 0 } },
  transitions: [
    { event: 'acquire', from: 'free', to: 'held' },
    { event: 'release', from: 'held', to: 'released' },
  ],
  invariants: [{ name: 'exclusive', assert: [{ path: '/owners', op: 'lte', right: { value: 1 } }] }],
  terminal_states: ['released'],
});

function precisionModel() {
  return `{"$schema":"des/state-machine/v1","name":"precision","initial":"done",
    "states":{"done":{"left":9007199254740993,"right":9007199254740992.0}},
    "terminal_states":["done"],"invariants":[{"name":"not rounded","assert":[
      {"path":"/left","op":"lte","right":{"path":"/right"}}
    ]}]}`;
}

test('state bounds reject nonintegers, coercion tricks, and out-of-range values', () => {
  for (const value of [1, '1', 10000, '100000']) assert.equal(parseStateBound(value), Number(value));
  for (const value of [0, -1, 100001, 1.5, '', ' 1', '1 ', '1e3', '01', '1.0', true, null, undefined, NaN, [1], { toString: () => '1' }]) {
    assert.throws(() => parseStateBound(value), /max_states/);
  }
});

test('glob grammar rejects traversal and unsupported expansion', () => {
  for (const pattern of ['', '/a.json', '../a.json', 'a/../b.json', './a.json', 'a//b.json',
    'a\\b.json', 'a/[ab].json', 'a/{a,b}.json', 'a/**x.json', 'a/\n.json', '*.txt', `${'a'.repeat(257)}.json`]) {
    assert.throws(() => parsePattern(pattern), /model_glob/);
  }
});

test('glob automaton handles zero or many directories, question marks, and literal punctuation', () => {
  for (const name of ['formal/a.json', 'formal/nested/a.json', 'formal/nested/deeper/a.json']) {
    assert.equal(matches('formal/**/*.json', name), true);
  }
  assert.equal(matches('formal/*.json', 'formal/nested/a.json'), false);
  assert.equal(matches('formal/?.json', 'formal/λ.json'), true);
  assert.equal(matches('formal/?.json', 'formal/ab.json'), false);
  assert.equal(matches('formal/a+b.json', 'formal/a+b.json'), true);
  assert.equal(matches('formal/a+b.json', 'formal/aaab.json'), false);
  assert.equal(matches('**/**/*.json', 'a.json'), true);
});

test('discovery is deterministic, handles nested files, and ignores unrelated directories', async t => {
  const root = await workspace(t);
  await write(root, 'formal/z.json');
  await write(root, 'formal/sub/a.json');
  await write(root, 'formal/a.json');
  await write(root, 'unrelated/x.json');
  const models = await discoverModels(root, 'formal/**/*.json');
  assert.deepEqual(models.map(model => model.relative), ['formal/a.json', 'formal/sub/a.json', 'formal/z.json']);
});

test('an empty model selection fails closed', async t => {
  const root = await workspace(t);
  await write(root, 'formal/README.md');
  await assert.rejects(discoverModels(root, 'formal/**/*.json'), /no model files/);
});

test('model file symlinks are rejected, even when their target is inside the workspace', async t => {
  const root = await workspace(t);
  const source = await write(root, 'source.json');
  await fs.mkdir(path.join(root, 'formal'));
  await fs.symlink(source, path.join(root, 'formal/model.json'));
  await assert.rejects(discoverModels(root, 'formal/**/*.json'), /symlink/);
});

test('directory symlinks and cycles are rejected before traversal', async t => {
  const root = await workspace(t);
  await write(root, 'formal/ok.json');
  await fs.symlink(path.join(root, 'formal'), path.join(root, 'formal/loop'));
  await assert.rejects(discoverModels(root, 'formal/**/*.json'), /symlink/);
});

test('a symlink escape never supplies an external model', async t => {
  const root = await workspace(t);
  const outside = await workspace(t);
  await write(outside, 'secret.json');
  await fs.symlink(outside, path.join(root, 'formal'));
  await assert.rejects(discoverModels(root, 'formal/**/*.json'), /symlink/);
});

test('helper source cannot be mistaken for caller model coverage', async t => {
  const root = await workspace(t);
  await write(root, '.des-formal-checker/example.json');
  await assert.rejects(discoverModels(root, '**/*.json', { excluded: ['.des-formal-checker'] }), /intersects/);
});

test('file and directory entry limits are enforced during discovery', async t => {
  const root = await workspace(t);
  for (const name of ['a', 'b', 'c']) await write(root, `formal/${name}.json`);
  await assert.rejects(discoverModels(root, 'formal/**/*.json', { limits: { files: 2 } }), /too many/);
  await assert.rejects(discoverModels(root, 'formal/**/*.json', { limits: { entries: 2 } }), /entry limit/);
});

test('depth, file-size, and control-character path limits fail closed', async t => {
  const deep = await workspace(t);
  await write(deep, 'formal/a/b/c.json');
  await assert.rejects(discoverModels(deep, 'formal/**/*.json', { limits: { depth: 1 } }), /depth limit/);
  const large = await workspace(t);
  await write(large, 'formal/a.json', '12345');
  await assert.rejects(discoverModels(large, 'formal/**/*.json', { limits: { fileBytes: 4 } }), /byte limit/);
  const controls = await workspace(t);
  await write(controls, 'formal/a\nb.json');
  await assert.rejects(discoverModels(controls, 'formal/**/*.json'), /controls/);
});

test('aggregate size and malformed UTF-8 fail before the checker runs', async t => {
  const root = await workspace(t);
  await write(root, 'formal/a.json', '1234');
  await write(root, 'formal/b.json', '5678');
  const executable = await checker(root, 'console.log("unexpected execution"); process.exit(0);');
  await assert.rejects(gate(root, executable, { limits: { totalBytes: 7 } }), /aggregate/);
  const invalid = await workspace(t);
  await write(invalid, 'formal/a.json', Buffer.from([0xff]));
  await assert.rejects(gate(invalid, executable), /encoded data|encoding/i);
});

test('snapshots preserve exact checked bytes and their original path hashes', async t => {
  const root = await workspace(t);
  const raw = '{ "note": "λ", "count": 9007199254740993 }\n';
  const original = await write(root, 'formal/-model;$.json', raw);
  const executable = await checker(root, `
    import fs from 'node:fs';
    import path from 'node:path';
    const args = process.argv.slice(2);
    if (args[0] !== '--max-states' || args[1] !== '1000' || args[2] !== '--') process.exit(9);
    const files = args.slice(3);
    const result = files.map(file => ({ path: file, bytes: fs.readFileSync(file, 'utf8') }));
    console.log(JSON.stringify(result));
  `);
  const revisions = { caller: 'a'.repeat(40), checker: 'b'.repeat(40), runner: 'c'.repeat(40) };
  const result = await gate(root, executable, { revisions });
  assert.equal(result.code, 0);
  const snapshots = JSON.parse(result.stdout);
  assert.notEqual(snapshots[0].path, original);
  assert.equal(snapshots[0].bytes, raw);
  assert.deepEqual(result.evidence.models, [{ path: 'formal/-model;$.json', bytes: Buffer.byteLength(raw),
    sha256: createHash('sha256').update(raw).digest('hex') }]);
  assert.deepEqual(result.evidence.revisions, revisions);
  assert.equal(result.evidence.modelOnly, true);
  await assert.rejects(fs.stat(snapshots[0].path), { code: 'ENOENT' });
  assert.equal(await fs.readFile(original, 'utf8'), raw);
});

test('process exit codes 0, 1, and 2 remain distinct', async () => {
  for (const code of [0, 1, 2]) {
    const result = await runProcess(process.execPath, ['-e', `console.log('evidence'); process.exit(${code});`]);
    assert.equal(result.code, code);
    assert.equal(result.reason, null);
  }
});

test('unexpected exit codes, signals, and spawn failure become checker errors', async () => {
  const unexpected = await runProcess(process.execPath, ['-e', 'process.exit(7);']);
  assert.equal(unexpected.code, 2);
  assert.match(unexpected.reason, /unexpected/);
  const signaled = await runProcess(process.execPath, ['-e', 'process.kill(process.pid, "SIGTERM");']);
  assert.equal(signaled.code, 2);
  assert.match(signaled.reason, /SIGTERM/);
  const missing = await runProcess('/definitely-missing-des-checker', []);
  assert.equal(missing.code, 2);
  assert.match(missing.reason, /could not start/);
});

test('checker execution time is bounded', async () => {
  const result = await runProcess(process.execPath, ['-e', 'setInterval(() => {}, 10000);'], {
    limits: { timeoutMs: 150 },
  });
  assert.equal(result.code, 2);
  assert.match(result.reason, /timed out/);
});

test('combined stdout and stderr are bounded while streaming', async () => {
  const result = await runProcess(process.execPath, ['-e',
    'process.stdout.write("a".repeat(1000)); process.stderr.write("b".repeat(1000));'], {
    limits: { outputBytes: 256 },
  });
  assert.equal(result.code, 2);
  assert.match(result.reason, /output exceeds/);
  assert.ok(Buffer.byteLength(result.stdout) + Buffer.byteLength(result.stderr) <= 256);
});

test('empty success is not verification evidence', async t => {
  const root = await workspace(t);
  await write(root, 'formal/a.json');
  const executable = await checker(root, 'process.exit(0);');
  const result = await gate(root, executable);
  assert.equal(result.code, 2);
  assert.equal(result.evidence.outcome, 'ERROR');
  assert.match(result.reason, /without evidence/);
});

test('counterexample and invalid-model outcomes cannot be relabeled PASS', async t => {
  for (const [code, expected] of [[1, 'COUNTEREXAMPLE'], [2, 'ERROR']]) {
    const root = await workspace(t);
    await write(root, 'formal/a.json');
    const executable = await checker(root, `console.log('diagnostic'); process.exit(${code});`);
    const result = await gate(root, executable);
    assert.equal(result.code, code);
    assert.equal(result.evidence.outcome, expected);
  }
});

const native = process.env.DES_FORMAL_CHECKER_PATH;
if (process.env.DES_REQUIRE_NATIVE_CHECKER === '1' && !native) {
  throw new Error('DES_FORMAL_CHECKER_PATH is required: native controls may not be skipped in CI');
}
const nativeCases = [
  ['valid model', positive, 0],
  ['safety counterexample', positive.replace('"held":{"owners":1}', '"held":{"owners":2}'), 1],
  ['malformed JSON', '{not-json}', 2],
  ['duplicate state names', '{"$schema":"des/state-machine/v1","name":"duplicate","initial":"done",' +
    '"states":{"done":{},"done":{}},"terminal_states":["done"]}', 2],
  ['mixed-number false-pass regression', precisionModel(), 1],
  ['overflowing integer literal', precisionModel().replace('9007199254740993', '18446744073709551616'), 2],
  ['missing guard input', JSON.stringify({
    $schema: 'des/state-machine/v1', name: 'missing guard', initial: 'done',
    states: { done: { amount: -1 }, unused: { kind: 'protected', amount: 1 } },
    terminal_states: ['done'], invariants: [{ name: 'protected amount',
      when: [{ path: '/kind', op: 'eq', right: { value: 'protected' } }],
      assert: [{ path: '/amount', op: 'gte', right: { value: 0 } }],
    }],
  }), 1],
];
for (const [name, raw, expected] of nativeCases) {
  test(`native verifier: ${name}`, { skip: native ? false : 'native Rust binary not available locally' }, async t => {
    const root = await workspace(t);
    await write(root, 'formal/model.json', raw);
    const result = await gate(root, native);
    assert.equal(result.code, expected, result.stdout + result.stderr);
    assert.equal(result.evidence.outcome, expected === 0 ? 'PASS' : expected === 1 ? 'COUNTEREXAMPLE' : 'ERROR');
  });
}
