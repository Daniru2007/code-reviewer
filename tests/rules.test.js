import test from 'node:test';
import assert from 'node:assert/strict';

import Issue from '../core/issue.js';
import AnalyzerContext from '../core/scope.js';
import { ErrorCodes, Kinds } from '../core/types.js';
import NamingConventionChecker from '../rules/conventionChecker.js';
import { checkParamLength } from '../rules/paramLength.js';
import { checkFunctionLength } from '../rules/functionLength.js';
import checkShadows from '../rules/shadowChecker.js';
import checkUnusedVars from '../rules/unusedVar.js';

test('NamingConventionChecker accepts valid names for each supported kind', () => {
  assert.equal(NamingConventionChecker(Kinds.VARIABLE, { id: { name: 'camelCase' } }), undefined);
  assert.equal(NamingConventionChecker(Kinds.PARAMETER, { name: 'paramName' }), undefined);
  assert.equal(NamingConventionChecker(Kinds.FUNCTION, { id: { name: 'buildValue' } }), undefined);
  assert.equal(NamingConventionChecker(Kinds.CLASS, { id: { name: 'UserProfile' } }), undefined);
  assert.equal(NamingConventionChecker(Kinds.CONST, { id: { name: 'MAX_SIZE' } }), undefined);
});

test('NamingConventionChecker reports the expected code for invalid names', () => {
  assert.equal(NamingConventionChecker(Kinds.VARIABLE, { id: { name: 'snake_case' } }).code, ErrorCodes.NAMING_CAMEL);
  assert.equal(NamingConventionChecker(Kinds.PARAMETER, { name: 'BadParam' }).code, ErrorCodes.NAMING_CAMEL);
  assert.equal(NamingConventionChecker(Kinds.FUNCTION, { id: { name: 'BadFunction' } }).code, ErrorCodes.NAMING_CAMEL);
  assert.equal(NamingConventionChecker(Kinds.CLASS, { id: { name: 'notPascal' } }).code, ErrorCodes.NAMING_PASCAL);
  assert.equal(NamingConventionChecker(Kinds.CONST, { id: { name: 'not_constant' } }).code, ErrorCodes.NAMING_SCREAMING);
});

test('checkParamLength only flags functions with more than five parameters', () => {
  assert.equal(checkParamLength({ params: new Array(5).fill({}) }), undefined);

  const issue = checkParamLength({
    params: new Array(6).fill({}),
    id: { name: 'tooManyParams' },
    loc: { start: { line: 1, column: 0 } },
  });

  assert.ok(issue instanceof Issue);
  assert.equal(issue.code, ErrorCodes.MAX_P);
});

test('checkFunctionLength only flags functions longer than forty lines', () => {
  assert.equal(checkFunctionLength({
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 40, column: 0 },
    },
  }), null);

  const issue = checkFunctionLength({
    id: { name: 'veryLongFunction' },
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 41, column: 0 },
    },
  });

  assert.ok(issue instanceof Issue);
  assert.equal(issue.code, ErrorCodes.FUNC_LEN);
});

test('checkShadows finds shadowed declarations in ancestor scopes and ignores globals without parents', () => {
  const context = new AnalyzerContext();
  context.enterScope();
  const rootDeclaration = { id: { name: 'value' } };
  context.addDeclaration(rootDeclaration);

  context.enterScope();
  const innerDeclaration = { id: { name: 'value' } };
  const innerIssue = checkShadows(innerDeclaration, context.currentScope);

  assert.ok(innerIssue instanceof Issue);
  assert.equal(innerIssue.code, ErrorCodes.SHADOW_VAR);

  const standaloneIssue = checkShadows({ id: { name: 'value' } }, context.globalScope);
  assert.equal(standaloneIssue, null);
});

test('checkUnusedVars adds warnings for declarations without matching references', () => {
  const context = new AnalyzerContext();
  context.enterScope();

  const usedDeclaration = { id: { name: 'used' }, loc: { start: { line: 1, column: 0 } } };
  const unusedDeclaration = { id: { name: 'unused' }, loc: { start: { line: 2, column: 0 } } };
  context.addDeclaration(usedDeclaration);
  context.addDeclaration(unusedDeclaration);
  context.addReference({ name: 'used' });

  checkUnusedVars(context);

  assert.equal(context.issues.length, 1);
  assert.equal(context.issues[0].code, ErrorCodes.UNUSED_VAR);
  assert.equal(context.issues[0].node, unusedDeclaration);
});
