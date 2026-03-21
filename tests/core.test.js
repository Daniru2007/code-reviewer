import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import readSource from '../core/reader.js';
import parse from '../core/parse.js';
import { logIssues } from '../core/logger.js';
import Issue from '../core/issue.js';
import AnalyzerContext from '../core/scope.js';
import { ErrorCodes, Rules, Severity } from '../core/types.js';

test('readSource returns file contents', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-reviewer-reader-'));
  const filePath = path.join(tempDir, 'sample.js');
  fs.writeFileSync(filePath, 'const ANSWER = 42;\n', 'utf8');

  assert.equal(readSource(filePath), 'const ANSWER = 42;\n');
});

test('parse returns a Babel AST with location information', () => {
  const ast = parse('const ANSWER = 42;\n');

  assert.equal(ast.type, 'File');
  assert.equal(ast.program.body[0].type, 'VariableDeclaration');
  assert.equal(ast.program.body[0].loc.start.line, 1);
});

test('Issue.location returns null when node has no location and start coordinates otherwise', () => {
  const locatedIssue = new Issue({
    rule: Rules.NAMING,
    code: ErrorCodes.NAMING_CAMEL,
    severity: Severity.WARNING,
    node: {
      loc: {
        start: {
          line: 3,
          column: 5,
        },
      },
    },
  });

  const unlocatedIssue = new Issue({
    rule: Rules.UNUSED,
    code: ErrorCodes.UNUSED_VAR,
    severity: Severity.INFO,
  });

  assert.deepEqual(locatedIssue.location, { line: 3, column: 5 });
  assert.equal(unlocatedIssue.location, null);
});

test('logIssues formats known and unknown issue codes with optional file names', () => {
  const messages = [];
  const originalConsoleLog = console.log;
  console.log = (message) => messages.push(message);

  try {
    logIssues([
      new Issue({
        rule: Rules.NAMING,
        code: ErrorCodes.NAMING_CAMEL,
        severity: Severity.WARNING,
        node: {
          name: 'Bad_Name',
          loc: { start: { line: 2, column: 4 } },
        },
      }),
      new Issue({
        rule: 'unknown',
        code: 'ZZ999',
        severity: Severity.ERROR,
        node: {
          id: { name: 'mystery' },
          loc: { start: { line: 7, column: 1 } },
        },
      }),
    ], 'sample.js');
  } finally {
    console.log = originalConsoleLog;
  }

  assert.deepEqual(messages, [
    'sample.js:2:4 [WARNING][NC001] "Bad_Name" should be in camelCase',
    'sample.js:7:1 [ERROR][ZZ999] Unknown issue: mystery',
  ]);
});

test('AnalyzerContext tracks scopes, propagates references, and reports maximum depth', () => {
  const context = new AnalyzerContext();
  const outerDeclaration = { id: { name: 'outer' } };
  const nestedReference = { name: 'outer' };

  assert.equal(context.currentScope.parent, null);

  context.enterScope();
  context.addDeclaration(outerDeclaration);
  const innerScopeWarning = context.enterScope();
  context.addReference(nestedReference);
  context.exitScope();

  assert.equal(innerScopeWarning, null);
  assert.deepEqual([...context.currentScope.references], [nestedReference]);

  let depthWarning = null;
  for (let i = context.depth; i < context.MAX_DEPTH; i += 1) {
    depthWarning = context.enterScope() ?? depthWarning;
  }

  assert.ok(depthWarning instanceof Issue);
  assert.equal(depthWarning.code, ErrorCodes.DEP_EXC);

  const depthBeforeInvalidExit = context.depth;
  while (context.currentScope.parent) {
    context.exitScope();
  }
  context.exitScope();

  assert.equal(context.depth, 0);
  assert.equal(context.currentScope.parent, null);
  assert.ok(depthBeforeInvalidExit > context.depth);
});
