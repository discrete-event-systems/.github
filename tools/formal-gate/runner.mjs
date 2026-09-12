import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const LIMITS = Object.freeze({
  files: 250, fileBytes: 4_000_000, totalBytes: 20_000_000,
  entries: 10_000, depth: 64, outputBytes: 1_000_000, timeoutMs: 120_000,
});

export function parseStateBound(value) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error('max_states must be an integer between 1 and 100000');
  }
  const text = String(value);
  if (!/^[1-9][0-9]{0,5}$/.test(text) || Number(text) > 100_000) {
    throw new Error('max_states must be an integer between 1 and 100000');
  }
  return Number(text);
}

export function parsePattern(pattern) {
  if (typeof pattern !== 'string' || !pattern || pattern.length > 256 ||
      /[\\\x00-\x1f\x7f\[\]{}]/u.test(pattern) || path.posix.isAbsolute(pattern)) {
    throw new Error('model_glob must be a bounded relative POSIX glob');
  }
  const parts = pattern.split('/');
  if (parts.length > 32 || !pattern.endsWith('.json') ||
      parts.some(p => !p || p === '.' || p === '..' || (p.includes('**') && p !== '**'))) {
    throw new Error('model_glob supports literal components, *, ?, and whole-component ** ending in .json');
  }
  return parts;
}

// Greedy component matcher: no regular-expression backtracking or shell expansion.
function segmentMatches(pattern, name) {
  const p = Array.from(pattern), n = Array.from(name);
  let i = 0, j = 0, star = -1, retry = 0;
  while (j < n.length) {
    if (i < p.length && (p[i] === '?' || p[i] === n[j])) { i++; j++; }
    else if (p[i] === '*') { star = i++; retry = j; }
    else if (star >= 0) { i = star + 1; j = ++retry; }
    else return false;
  }
  while (p[i] === '*') i++;
  return i === p.length;
}

function closure(parts, states) {
  const result = new Set(states);
  for (const i of result) if (parts[i] === '**') result.add(i + 1);
  return result;
}

function advance(parts, states, name) {
  const next = new Set();
  for (const i of states) {
    if (parts[i] === '**') next.add(i);
    else if (i < parts.length && segmentMatches(parts[i], name)) next.add(i + 1);
  }
  return closure(parts, next);
}

export function matches(pattern, relativePath) {
  const parts = parsePattern(pattern);
  let states = closure(parts, [0]);
  for (const name of relativePath.split('/')) states = advance(parts, states, name);
  return states.has(parts.length);
}

function within(candidate, root) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

export async function discoverModels(root, pattern, options = {}) {
  const limits = { ...LIMITS, ...options.limits };
  root = await fs.realpath(root);
  const excluded = (options.excluded ?? []).map(p => path.resolve(root, p));
  const parts = parsePattern(pattern), files = [];
  let visited = 0;
  async function walk(directory, states, depth) {
    if (depth > limits.depth) throw new Error('model traversal exceeds depth limit');
    const entries = [];
    const handle = await fs.opendir(directory);
    for await (const entry of handle) {
      if (++visited > limits.entries) throw new Error('model traversal exceeds entry limit');
      entries.push(entry.name);
    }
    for (const name of entries.sort()) {
      const next = advance(parts, states, name);
      if (next.size === 0) continue;
      const absolute = path.join(directory, name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      if (relative.length > 1024 || /[\x00-\x1f\x7f]/u.test(relative)) {
        throw new Error('model path contains controls or exceeds 1024 characters');
      }
      if (excluded.some(p => within(absolute, p))) throw new Error('model_glob intersects checker or gate source');
      const stat = await fs.lstat(absolute);
      if (stat.isSymbolicLink()) throw new Error(`symlink in model traversal: ${relative}`);
      if (stat.isDirectory()) {
        if ([...next].some(i => i < parts.length)) await walk(absolute, next, depth + 1);
      } else if (next.has(parts.length)) {
        if (!stat.isFile()) throw new Error(`model is not a regular file: ${relative}`);
        if (stat.size > limits.fileBytes) throw new Error(`model exceeds byte limit: ${relative}`);
        if (files.length >= limits.files) throw new Error('too many model files');
        files.push({ absolute, relative });
      }
    }
  }
  await walk(root, closure(parts, [0]), 0);
  if (!files.length) throw new Error('no model files matched');
  return files.sort((a, b) => a.relative < b.relative ? -1 : a.relative > b.relative ? 1 : 0);
}

async function readBounded(file, root, excluded, limit) {
  const flags = constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK;
  const handle = await fs.open(file, flags);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > limit) throw new Error('model is not a bounded regular file');
    // Linux descriptor resolution checks the opened file, not a second read of
    // a possibly swapped pathname. The workflow deliberately uses Ubuntu.
    const opened = await fs.realpath(`/proc/self/fd/${handle.fd}`);
    if (!within(opened, root) || excluded.some(p => within(opened, p))) {
      throw new Error('opened model escapes the allowed workspace');
    }
    const buffer = Buffer.alloc(limit + 1);
    let used = 0;
    while (used < buffer.length) {
      const { bytesRead } = await handle.read(buffer, used, buffer.length - used, null);
      if (!bytesRead) break;
      used += bytesRead;
    }
    if (used > limit) throw new Error('model exceeds byte limit while reading');
    const bytes = buffer.subarray(0, used);
    new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return bytes;
  } finally { await handle.close(); }
}

export function runProcess(command, args, options = {}) {
  const limits = { ...LIMITS, ...options.limits };
  return new Promise(resolve => {
    let reason = null, used = 0;
    const stdout = [], stderr = [];
    const child = spawn(command, args, { cwd: options.cwd, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    const stop = message => { reason ??= message; child.kill('SIGKILL'); };
    const timer = setTimeout(() => stop('checker timed out'), limits.timeoutMs);
    function consume(list, chunk) {
      const remaining = Math.max(0, limits.outputBytes - used);
      if (remaining) list.push(chunk.subarray(0, remaining));
      used += chunk.length;
      if (used > limits.outputBytes) stop('checker output exceeds byte limit');
    }
    child.stdout.on('data', chunk => consume(stdout, chunk));
    child.stderr.on('data', chunk => consume(stderr, chunk));
    child.on('error', error => { reason ??= `checker could not start: ${error.code ?? 'error'}`; });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (signal) reason ??= `checker terminated by ${signal}`;
      if (![0, 1, 2].includes(code)) reason ??= 'checker returned an unexpected exit status';
      resolve({ code: reason ? 2 : code, reason,
        stdout: Buffer.concat(stdout).toString('utf8'), stderr: Buffer.concat(stderr).toString('utf8') });
    });
  });
}

export async function runGate({ root, pattern, maxStates, checker, revisions = {}, limits = {}, excluded = [] }) {
  const bound = parseStateBound(maxStates);
  const cap = { ...LIMITS, ...limits };
  root = await fs.realpath(root);
  checker = await fs.realpath(checker);
  const excludedPaths = excluded.map(p => path.resolve(root, p));
  const files = await discoverModels(root, pattern, { limits: cap, excluded });
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'des-formal-input-'));
  try {
    const models = [], paths = [];
    let total = 0;
    for (const [index, file] of files.entries()) {
      const bytes = await readBounded(file.absolute, root, excludedPaths, cap.fileBytes);
      total += bytes.length;
      if (total > cap.totalBytes) throw new Error('models exceed aggregate byte limit');
      const snapshot = path.join(temporary, `${index}.json`);
      await fs.writeFile(snapshot, bytes, { flag: 'wx', mode: 0o600 });
      paths.push(snapshot);
      models.push({ path: file.relative, bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex') });
    }
    const result = await runProcess(checker, ['--max-states', String(bound), '--', ...paths], { cwd: temporary, limits: cap });
    if (result.code === 0 && !result.stdout.trim()) {
      result.code = 2;
      result.reason = 'checker reported success without evidence';
    }
    return { ...result, evidence: {
      schema: 'des.formal-gate.evidence.v1', modelOnly: true,
      revisions, maxStates: bound, models,
      outcome: result.code === 0 ? 'PASS' : result.code === 1 ? 'COUNTEREXAMPLE' : 'ERROR',
      exitCode: result.code, executionError: result.reason,
    } };
  } finally {
    // Only this invocation's newly created synthetic snapshots are removed.
    await fs.rm(temporary, { recursive: true, force: true });
  }
}

async function main() {
  const revisions = {};
  for (const [name, variable] of [['caller', 'CALLER_SHA'], ['checker', 'CHECKER_SHA'], ['runner', 'GATE_SHA']]) {
    const value = process.env[variable];
    if (!/^[0-9a-f]{40}$/.test(value ?? '')) throw new Error(`${variable} must identify the exact checked revision`);
    revisions[name] = value;
  }
  const result = await runGate({ root: process.cwd(), pattern: process.env.MODEL_GLOB,
    maxStates: process.env.MAX_STATES, checker: process.env.CHECKER_PATH, revisions,
    excluded: ['.des-formal-checker', '.des-formal-gate'] });
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  if (result.reason) process.stderr.write(`${result.reason}\n`);
  if (process.env.EVIDENCE_PATH) {
    await fs.writeFile(process.env.EVIDENCE_PATH, JSON.stringify(result.evidence, null, 2) + '\n', { flag: 'wx' });
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summary = `## Formal model gate: ${result.evidence.outcome}\n\n` +
      `Model verification only; implementation conformance and fairness are not established.\n\n` +
      JSON.stringify(result.evidence, null, 2).split('\n').map(line => `    ${line}`).join('\n') + '\n';
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  }
  process.exitCode = result.code;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`formal gate: ${error.message}`); process.exitCode = 2; });
}
