# code-reviewer

A lightweight static analyzer for JavaScript that parses source code with Babel, walks the AST, and reports style/safety findings such as naming violations, shadowed variables, unused declarations, deep nesting, and excessive parameter counts.

## Table of contents

- [What this project does](#what-this-project-does)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [How analysis works](#how-analysis-works)
- [Rules implemented](#rules-implemented)
- [Issue model and messages](#issue-model-and-messages)
- [CLI entrypoint](#cli-entrypoint)
- [Programmatic usage](#programmatic-usage)
- [Development](#development)
- [Testing](#testing)
- [Known limitations and future improvements](#known-limitations-and-future-improvements)

## What this project does

The analyzer runs a fixed pipeline:

1. Read source code from disk.
2. Parse code to a Babel AST (`sourceType: "module"`, `locations: true`).
3. Traverse the AST while tracking lexical scopes.
4. Apply rules and collect `Issue` objects.
5. Render issues into human-readable log lines.

The default run target is `./example.js` through `main.js`.

## Architecture

The codebase is split into four main areas:

- `core/` — analysis runtime primitives (parse/read/traverse context/issues/logging).
- `rules/` — individual rule implementations.
- `tests/` — Node test runner suites for core behavior, rules, analyzer integration, and CLI behavior.
- Root scripts (`main.js`, `sec.js`, `example.js`) — entrypoint, legacy prototype, and sample input.

## Repository structure

```text
.
├── core/
│   ├── analyzer.js            # AST traversal + rule orchestration
│   ├── issue.js               # Issue domain model
│   ├── logger.js              # Issue-to-console formatting
│   ├── parse.js               # Babel parse wrapper
│   ├── reader.js              # File reader utility
│   ├── scope.js               # Scope/context tracking
│   ├── trie.js                # Experimental AST trie structures
│   └── types.js               # Constants: kinds/rules/severity/error codes
├── rules/
│   ├── conventionChecker.js   # Naming convention rule
│   ├── functionLength.js      # Function length rule (> 40 lines)
│   ├── paramLength.js         # Parameter count rule (> 5 params)
│   ├── shadowChecker.js       # Variable shadowing rule
│   └── unusedVar.js           # Unused declaration rule
├── tests/
│   ├── analyzer.test.js       # End-to-end analyzer behavior
│   ├── core.test.js           # Core utility and context tests
│   ├── main.test.js           # CLI smoke test
│   └── rules.test.js          # Unit tests per rule
├── example.js                 # Sample source analyzed by main.js
├── main.js                    # CLI pipeline entrypoint
├── messages.json              # Error-code to message templates
├── sec.js                     # Legacy standalone prototype analyzer
└── package.json               # Scripts and dependencies
```

## How analysis works

### 1) Reading and parsing

- `readSource(fileName)` in `core/reader.js` performs synchronous UTF-8 reads.
- `parse(code)` in `core/parse.js` uses `@babel/parser` and preserves node locations.

### 2) Traversal and context

`core/analyzer.js` owns traversal and coordinates rules. It initializes an `AnalyzerContext` and then walks the AST with `@babel/traverse`.

`AnalyzerContext` in `core/scope.js` provides:

- scope tree (`globalScope`, `currentScope`, `parent` links),
- declaration/reference sets per scope,
- collected issues (`issues` array),
- nesting depth tracking with `MAX_DEPTH = 5`.

On each `enterScope()` call, depth increases and a depth issue is emitted once `depth == MAX_DEPTH`.

On each `exitScope()` call, references are propagated up one scope level so ancestor declarations can be recognized as used.

### 3) Declaration and reference handling

- Declarations are added from `VariableDeclaration` and `FunctionDeclaration` nodes.
- Function parameters are explicitly extracted from:
  - `Identifier`
  - `AssignmentPattern`
  - `ObjectPattern`
  - `ArrayPattern`
- Identifiers are recorded as references except declaration-site identifiers (`VariableDeclarator`, `FunctionDeclaration`).

### 4) Rule execution points

- `VariableDeclaration`:
  - naming convention check,
  - shadowing check,
  - declaration registration.
- `FunctionDeclaration` (enter):
  - function naming check,
  - declaration registration,
  - max-parameter check,
  - parameter naming checks + declaration registration,
  - new lexical scope entry.
- `FunctionDeclaration` (exit):
  - unused-variable check in function scope,
  - scope exit.
- `Program` (exit):
  - unused-variable check in program scope,
  - scope exit.
- Control-flow nodes (`if`, loops, `switch`, `try/catch`, conditional expressions):
  - scope depth tracking via `enterBlock` / `exitScope`.

## Rules implemented

### Naming convention (`rules/conventionChecker.js`)

Applied by semantic kind from `core/types.js`:

- variables / parameters / functions: `camelCase`.
- classes: `PascalCase`.
- constants: `SCREAMING_SNAKE_CASE`.

Error codes:

- `NC001` — expected camelCase.
- `NC002` — expected PascalCase.
- `NC003` — expected SCREAMING_SNAKE_CASE.

### Unused variable (`rules/unusedVar.js`)

For each declaration in current scope, emits `UV001` if no reference with matching name exists in that scope's reference set.

### Shadowing (`rules/shadowChecker.js`)

Recursively inspects ancestor scopes for matching declaration names and emits `SV001` when an inner declaration shadows an outer one.

### Maximum parameter count (`rules/paramLength.js`)

Emits `MP001` when a function has more than 5 parameters.

### Function length (`rules/functionLength.js`)

Emits `FL001` when a function spans more than 40 lines (`end.line - start.line + 1`).

> Note: this rule is currently implemented and unit-tested, but not yet wired into `core/analyzer.js` traversal.

### Maximum nesting depth (`core/scope.js` via analyzer scope entry)

Emits `DPE001` when nesting reaches configured depth limit (`MAX_DEPTH = 5`).

## Issue model and messages

`core/issue.js` defines the `Issue` object:

- `rule`: semantic rule id.
- `code`: compact error code (for example `NC001`).
- `node`: related AST node (optional).
- `severity`: `info`, `warning`, or `error`.
- `location` getter: returns `{ line, column }` from `node.loc.start` when available.

`core/logger.js` formats issues like:

```text
<filePrefix><line>:<column> [<SEVERITY>][<CODE>] <message>
```

Message templates come from `messages.json` and support `{name}` interpolation (identifier or fallback).

## CLI entrypoint

Run the built-in pipeline:

```bash
npm run dev
```

This executes `node main.js`, which:

1. Reads `./example.js`.
2. Parses AST.
3. Analyzes and accumulates issues.
4. Logs formatted output.

## Programmatic usage

You can use the analyzer from your own script:

```js
import parse from "./core/parse.js";
import analyze from "./core/analyzer.js";
import { logIssues } from "./core/logger.js";

const code = `
const badConst = 1;
function BadFunction(a, b, c, d, e, f) {
  let x = 1;
  return x;
}
`;

const ast = parse(code);
const context = analyze(ast);

logIssues(context.issues, "snippet.js");
```

## Development

### Prerequisites

- Node.js (version compatible with dependencies in `package.json`).
- npm.

### Install

```bash
npm install
```

### Scripts

- `npm run dev` — run analyzer against `example.js`.
- `npm test` — run all Node test suites.

## Testing

The project uses Node's built-in test runner (`node --test`) with coverage across:

- core utilities and context behavior,
- rule unit behavior,
- analyzer integration,
- CLI smoke execution.

Run:

```bash
npm test
```

## Known limitations and future improvements

- `rules/functionLength.js` is not currently invoked in `core/analyzer.js`.
- `core/trie.js` is an experimental structure and not integrated into the active analyzer pipeline.
- Scope classes `FunctionAnalysisScope` and `BlockScope` exist but are not currently instantiated.
- `main.js` uses a hardcoded input file path (`./example.js`) and no CLI argument parsing.
- No autofix support yet; output is reporting-only.

## Legacy prototype (`sec.js`)

`sec.js` appears to be an earlier standalone implementation of similar checks. It is useful for historical context, but the active implementation for tests and runtime is the modular pipeline in `core/` + `rules/`.
