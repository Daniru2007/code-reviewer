import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('main.js runs the analyzer pipeline against example.js', () => {
  const result = spawnSync(process.execPath, ['main.js'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\[WARNING\]\[MP001\]/);
  assert.equal(result.stderr, '');
});
