import test from 'node:test';
import assert from 'node:assert/strict';

import analyze from '../core/analyzer.js';
import parse from '../core/parse.js';
import { ErrorCodes } from '../core/types.js';

function getCodes(code) {
  return analyze(parse(code)).issues.map((issue) => issue.code);
}

test('analyze reports naming, shadowing, unused variable, depth, and parameter count issues', () => {
  const code = `
const badConst = 1;
let BadVariable = badConst;
class badClass {}
function BadFunction(BadParam, okTwo, okThree, okFour, okFive, okSix) {
  let outer = 1;
  let neverUsed = 0;
  if (true) {
    let outer = 2;
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            const deeplyNested = outer;
          }
        }
      }
    }
  }
  return BadParam + outer;
}
`;

  const codes = getCodes(code);

  assert.ok(codes.includes(ErrorCodes.NAMING_SCREAMING));
  assert.ok(codes.includes(ErrorCodes.NAMING_CAMEL));
  assert.ok(codes.includes(ErrorCodes.NAMING_PASCAL));
  assert.ok(codes.includes(ErrorCodes.SHADOW_VAR));
  assert.ok(codes.includes(ErrorCodes.UNUSED_VAR));
  assert.ok(codes.includes(ErrorCodes.DEP_EXC));
  assert.ok(codes.includes(ErrorCodes.MAX_P));
});

test('analyze extracts identifiers from destructured and defaulted parameters', () => {
  const code = `
function handleData({ ok: BadAlias }, [BadItem], BadAssigned = fallbackValue) {
  return BadAlias + BadItem + BadAssigned + fallbackValue;
}
`;

  const issues = analyze(parse(code)).issues;
  const codes = issues.map((issue) => issue.code);
  const names = issues.map((issue) => issue.node?.name ?? issue.node?.id?.name);

  assert.ok(codes.includes(ErrorCodes.NAMING_CAMEL));
  assert.ok(names.includes('BadAlias'));
  assert.ok(names.includes('BadItem'));
  assert.ok(names.includes('BadAssigned'));
  assert.ok(!codes.includes(ErrorCodes.UNUSED_VAR));
});

test('analyze ignores declaration identifiers as references but keeps runtime identifiers', () => {
  const code = `
let usedValue = 1;
function readValue() {
  return usedValue;
}
readValue();
`;

  const codes = getCodes(code);

  assert.equal(codes.includes(ErrorCodes.UNUSED_VAR), false);
});
