# Codi Test Framework - Development Plan

A comprehensive improvement plan for the Codi test framework, organized into phases by priority. Each item includes the problem, the affected files, and the proposed solution.

---

## Phase 0: Critical Bug Fixes

Issues that produce incorrect test results or silent failures. These must be fixed before any feature work.

### 0.1 `assertThrows` does not support async functions

**Files:** `src/assertions/assertThrows.js:4-14`, `src/assertions/browser.js:30-41`

**Problem:** The callback is invoked synchronously. If an `async` function is passed, its rejection becomes an unhandled promise rejection and the test silently passes.

```js
// Current - sync only
try {
  callback();        // If async, returns a Promise; never awaited
  throw new Error(message || 'Expected an error to be thrown');
} catch (error) { ... }
```

**Solution:**
- Make `assertThrows` async-aware: detect if `callback()` returns a thenable and await it.
- Alternatively, add a separate `assertRejects(asyncCallback, errorMessage, message)` and keep `assertThrows` sync-only but document the distinction.
- Recommended approach: single function that handles both, since forgetting to use the right one is the exact bug we're fixing.

```js
export async function assertThrows(callback, errorMessage, message) {
  try {
    const result = callback();
    if (result && typeof result.then === 'function') {
      await result;
    }
    throw new Error(message || 'Expected an error to be thrown');
  } catch (error) {
    if (error.message === (message || 'Expected an error to be thrown')) {
      throw error; // Re-throw our own sentinel
    }
    if (errorMessage !== undefined && error.message !== errorMessage) {
      throw new Error(
        message || `Expected error message to be "${errorMessage}", but got "${error.message}"`
      );
    }
  }
}
```

**Impact:** Must also update `it.js` to await assertions, and update the browser.js copy and the browserRunner inline copy.

---

### 0.2 `assertNotEqual` uses `===` while `assertEqual` uses deep comparison

**Files:** `src/assertions/assertNotEqual.js:3-9`, `src/assertions/browser.js:12-16`

**Problem:** `assertEqual({a:1}, {a:1})` passes (deep equality), but `assertNotEqual({a:1}, {a:1})` also passes (reference comparison with `===`). Users expect these to be symmetric.

**Solution:** Use `isDeepEqual` in `assertNotEqual` so it is the logical inverse of `assertEqual`.

```js
export function assertNotEqual(actual, expected, message) {
  if (isDeepEqual(actual, expected)) {
    throw new Error(message || `Expected values to not be equal`);
  }
}
```

**Note:** Extract `isDeepEqual` into a shared utility (`src/util/deepEqual.js`) so both assertions (and future ones) can import it without duplication.

---

### 0.3 `isDeepEqual` has correctness gaps

**Files:** `src/assertions/assertEqual.js:13-41`, `src/assertions/browser.js:53-81`

**Problem:** The current implementation does not handle:
- `NaN === NaN` (returns `false` with `===`, but they are semantically equal)
- `-0` vs `+0` (returns `true` with `===`, but they are semantically different)
- `Date` objects (compared by reference, not by `.getTime()`)
- `RegExp` objects (compared by reference, not by `.source` + `.flags`)
- `Map` and `Set` (compared as plain objects, keys don't match)
- `Array` vs plain `Object` (an object `{0: 'a', length: 1}` could match `['a']`)
- Circular references (infinite recursion / stack overflow)
- `Symbol`-keyed properties (ignored by `Object.keys`)

**Solution:** Rewrite `isDeepEqual` as a standalone utility in `src/util/deepEqual.js`:

```
1. Use Object.is() instead of === for primitives (handles NaN, -0)
2. Check constructor identity (Array vs Object, Date vs plain, etc.)
3. Handle Date: compare .getTime()
4. Handle RegExp: compare .source and .flags
5. Handle Map: compare size, then iterate entries with recursive comparison
6. Handle Set: compare size, then check each value exists in the other
7. Handle Array: compare .length then element-by-element
8. Use a WeakMap-based seen set for circular reference detection
9. Use Reflect.ownKeys() to include Symbol properties
```

---

### 0.4 Async initialization race condition in `_codi.js`

**Files:** `src/_codi.js:43-87`

**Problem:** Node.js-only modules (`mock`, `mockHttp`, `runTestFunction`, etc.) are loaded inside an unawaited async IIFE. If a test file imports `codi` and immediately uses `codi.mock`, the value may still be `null` because the dynamic imports haven't resolved yet.

**Solution:** Export a `ready` promise that consumers can await:

```js
let _ready;
if (!isBrowser) {
  _ready = (async () => {
    // ... dynamic imports ...
    Object.assign(codi, { runTestFunction, mock, mockHttp, ... });
  })();
} else {
  _ready = Promise.resolve();
}

export const ready = _ready;
```

Then in `testRunner.js` and any programmatic usage:

```js
import codi, { ready } from './_codi.js';
await ready;
// Now safe to use codi.mock, codi.runTestFunction, etc.
```

---

### 0.5 Browser runner hardcodes version string

**Files:** `src/runners/browserRunner.js:483`

**Problem:** `version: 'v1.0.38'` is hardcoded in the generated HTML. It will always drift from the actual version.

**Solution:** Import `version` from `_codi.js` (or a shared `version.js` constant) and interpolate it into the template string.

---

### 0.6 `describe` callback errors don't count as failures

**Files:** `src/core/describe.js:23-28`

**Problem:** If the `describe` callback itself throws (not from within an `it`), the error is logged but `state.failedTests` is never incremented. The suite appears to pass in the summary.

**Solution:** Increment `state.failedTests` and add a synthetic failed test entry to the suite when the callback throws:

```js
} catch (error) {
  state.failedTests++;
  state.addTestToSuite(nestedSuite, {
    name: `Suite setup error: ${nestedSuite.name}`,
    status: 'failed',
    error,
    duration: performance.now() - suite.startTime,
  });
}
```

---

## Phase 1: Core Feature Gaps

Features that users of any test framework expect. Without these, adoption is limited.

### 1.1 Lifecycle hooks: `beforeEach`, `afterEach`, `beforeAll`, `afterAll`

**Files to create/modify:** `src/core/hooks.js` (new), `src/core/describe.js`, `src/core/it.js`, `src/state/TestState.js`

**Problem:** There is no way to run setup/teardown logic before or after tests. Users must duplicate setup code in every `it` block.

**Design:**
- Hooks are registered on a suite and apply to all `it` blocks within that suite (and child suites for `beforeEach`/`afterEach`).
- `beforeAll` / `afterAll` run once per suite.
- `beforeEach` / `afterEach` run around every `it` in the suite (and nested suites).
- Hooks are stored on the suite object in `TestState.pushSuite()`.

```js
// Registration API (called inside describe callback):
codi.beforeAll(callback)
codi.afterAll(callback)
codi.beforeEach(callback)
codi.afterEach(callback)

// Alternatively, using the suite object passed to describe:
await codi.describe({ name: '...', id: '...' }, (suite) => {
  suite.beforeEach(() => { /* setup */ });
  suite.afterEach(() => { /* teardown */ });
});
```

**Implementation approach:**
- Add `beforeAll`, `afterAll`, `beforeEach`, `afterEach` arrays to the suite object in `TestState.pushSuite()`.
- In `it()`, walk up the suite tree to collect all `beforeEach`/`afterEach` hooks from ancestor suites, then run them in order (outermost first for before, innermost first for after).
- In `describe()`, run `beforeAll` hooks before the callback and `afterAll` hooks after.
- Hook errors should be reported as test failures with clear messages indicating which hook failed.

---

### 1.2 `.only` and `.skip` modifiers

**Files to modify:** `src/core/describe.js`, `src/core/it.js`, `src/state/TestState.js`

**Problem:** No way to focus on a single test or skip tests without commenting out code.

**Design:**
```js
codi.describe.only({ name: '...', id: '...' }, callback)  // Only run this suite
codi.describe.skip({ name: '...', id: '...' }, callback)  // Skip this suite
codi.it.only({ name: '...', parentId: '...' }, callback)  // Only run this test
codi.it.skip({ name: '...', parentId: '...' }, callback)  // Skip this test
```

**Implementation:**
- First pass: scan all registered suites/tests for `.only` markers.
- If any `.only` exists, all non-only suites/tests are treated as skipped.
- Skipped tests are recorded with `status: 'skipped'` and displayed differently in output (e.g., yellow with a skip icon).
- Add a `skippedTests` counter to `TestState`.

---

### 1.3 Per-test timeouts

**Files to modify:** `src/core/it.js`, `src/state/TestState.js` (for default config)

**Problem:** A hung async test hangs the entire suite indefinitely. The 30s timeout in browserRunner is suite-level, not per-test.

**Design:**
- Default timeout: 5000ms (configurable in `codi.json` as `"timeout": 5000`).
- Per-test override: `codi.it({ name: '...', parentId: '...', timeout: 10000 }, callback)`.

**Implementation:**
```js
const testPromise = Promise.race([
  (async () => { await callback(); })(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Test timed out after ${timeout}ms`)), timeout)
  ),
]);
```

---

### 1.4 Eliminate browser runner code duplication

**Files:** `src/runners/browserRunner.js:250-532`

**Problem:** The entire test framework (TestState, all assertions, describe, it) is re-implemented as inline JavaScript strings in the HTML template. Every bug fix or feature addition must be done in two places.

**Solution options (choose one):**

**Option A (Recommended): Use the built IIFE bundle.**
Instead of inlining a re-implementation, inject `dist/codi.browser.js` into the HTML `<script>` tag. The bundle already provides `window.codi` with all assertions and core functions.

```js
const bundlePath = path.join(__dirname, '../../dist/codi.browser.js');
const bundleCode = fs.readFileSync(bundlePath, 'utf8');
// Inject into HTML <script> tag
```

**Option B: Serve files via local HTTP server.**
Instead of data URLs, start a simple HTTP server, serve test files as ES modules, and navigate Puppeteer to it. This would also remove the need to strip import statements.

**Cleanup:** Once the duplication is removed, delete `src/assertions/browser.js` since the browser bundle handles that.

---

### 1.5 Input validation for `describe` and `it`

**Files:** `src/core/describe.js`, `src/core/it.js`

**Problem:** Missing or invalid parameters produce confusing errors or silent misbehavior:
- `describe({}, cb)` with no `name` or `id` -- no error, produces `undefined` in output.
- `it({name: 'test'}, cb)` with no `parentId` -- throws, but message could be clearer.
- `assertEqual()` with no arguments -- silently passes (both `undefined`).

**Solution:** Add validation at the top of `describe` and `it`:

```js
if (!params?.name) throw new Error('describe() requires a "name" parameter');
if (!params?.id) throw new Error('describe() requires an "id" parameter');
```

```js
if (!params?.name) throw new Error('it() requires a "name" parameter');
if (!params?.parentId) throw new Error('it() requires a "parentId" parameter');
```

---

## Phase 2: Developer Experience

Improvements that make the framework more pleasant and productive to use.

### 2.1 Support implicit lexical nesting (alternative to `id`/`parentId`)

**Files:** `src/core/describe.js`, `src/core/it.js`, `src/state/TestState.js`

**Problem:** The explicit `id`/`parentId` system is the framework's most distinctive feature but also its highest friction point. It requires extra boilerplate and manual ID management compared to Mocha/Jest-style lexical nesting.

**Design:** Support both styles. When no `id` is provided, auto-generate one and use a context stack:

```js
// Style 1: Explicit (existing, still supported)
codi.describe({ name: 'Suite', id: 'suite_1' }, () => {
  codi.it({ name: 'test', parentId: 'suite_1' }, () => { ... });
});

// Style 2: Implicit (new, simpler)
codi.describe('Suite', () => {
  codi.it('test', () => { ... });
});
```

**Implementation:**
- Maintain a `currentSuite` stack in `TestState`.
- When `describe` is called with a string (not an object), auto-generate an ID and push to the stack.
- When `it` is called with a string, use the top of the stack as `parentId`.
- Pop the stack when the `describe` callback completes.
- The explicit style continues to work as-is for advanced use cases.

---

### 2.2 Better error diffs for failed assertions

**Files:** `src/assertions/assertEqual.js`, new file `src/util/diff.js`

**Problem:** Failed `assertEqual` on complex objects shows the full JSON of both values. For large objects, it's difficult to spot the difference.

**Solution:** Implement a simple key-by-key diff that highlights only the differing paths:

```
assertEqual failed:
  message: "Objects are not equal"
  differences:
    .user.name: "Alice" !== "Bob"
    .user.age: missing in actual
```

This doesn't need to be a full diff algorithm -- just walk the two objects and collect paths where values diverge.

---

### 2.3 Expand the assertion library

**Files:** New files in `src/assertions/`, update `src/assertions/_assertions.js`

Add commonly needed assertions:

| Assertion | Description |
|-----------|-------------|
| `assertContains(haystack, needle, msg)` | String includes substring, or array includes element |
| `assertNotContains(haystack, needle, msg)` | Inverse of above |
| `assertMatch(value, regex, msg)` | Value matches a regular expression |
| `assertInstanceOf(value, Constructor, msg)` | `value instanceof Constructor` |
| `assertCloseTo(actual, expected, delta, msg)` | `Math.abs(actual - expected) <= delta` |
| `assertDeepContains(obj, subset, msg)` | Object contains all keys/values from subset |
| `assertNull(value, msg)` | Value is `null` |
| `assertNotNull(value, msg)` | Value is not `null` |
| `assertDefined(value, msg)` | Value is not `undefined` |
| `assertUndefined(value, msg)` | Value is `undefined` |
| `assertType(value, type, msg)` | `typeof value === type` |
| `assertLength(value, length, msg)` | Array/string has expected length |

---

### 2.4 TypeScript type definitions

**Files:** New file `types/codi.d.ts`, update `package.json` with `"types"` field

**Problem:** No autocomplete or type checking for framework users, even in JavaScript (via JSDoc/tsconfig `checkJs`).

**Solution:** Write a `.d.ts` file covering:
- `describe`, `it` (both string and object param overloads)
- All assertion functions
- `state`, `TestState` class
- Runner functions
- `codi` default export object
- Hook functions (once implemented)

---

### 2.5 Remove `process.exit()` from library code

**Files:** `src/runners/nodeRunner.js:95-101`, `src/runners/browserRunner.js:190-196`, `src/testRunner.js`

**Problem:** Calling `process.exit()` from library code prevents cleanup, breaks embedding, and makes programmatic usage awkward (`returnResults` is a workaround).

**Solution:**
- Runners should always return results.
- Move `process.exit()` to `cli.js` / `testRunner.js` only -- the CLI layer.
- Runners throw or return failure status; the CLI decides whether to exit.

---

## Phase 3: Advanced Features

Features for power users and CI/CD integration.

### 3.1 Watch mode

**Files:** New file `src/watcher.js`, update `cli.js` and `testRunner.js`

**Design:**
- `codi --watch <testDirectory>` watches for `.mjs` / `.js` file changes.
- On change, re-run only affected test files (or all tests in simple mode).
- Use `fs.watch` (recursive) or a lightweight dependency like `chokidar`.
- Clear screen between runs and show a summary.

---

### 3.2 Code coverage integration

**Files:** Update `package.json` scripts, optionally `cli.js`

**Design:**
- Document usage with `c8`: `c8 codi ./tests`
- Optionally add a `--coverage` flag that wraps execution with `c8` programmatically.
- Add coverage thresholds to `codi.json` config.

---

### 3.3 Parallel test file execution

**Files:** `src/runners/nodeRunner.js`, `src/state/TestState.js`

**Problem:** Test files run sequentially. For large test suites, this is slow.

**Design:**
- Use `worker_threads` to run test files in parallel.
- Each worker gets its own `TestState` instance.
- Main thread collects and merges results.
- Requires making `TestState` serializable or using message passing.
- Add `--parallel` flag and `"parallel": true` config option.

---

### 3.4 Reporter plugins

**Files:** New `src/reporters/` directory, `src/state/TestState.js`

**Design:** Support pluggable reporters:
- `console` (default, current behavior)
- `json` -- output results as JSON (for CI parsing)
- `junit` -- output JUnit XML (for CI systems like Jenkins, GitHub Actions)
- `tap` -- Test Anything Protocol
- `dot` -- minimal dot output for large suites

CLI: `codi ./tests --reporter json`

Config: `"reporter": "junit"` in `codi.json`

---

### 3.5 Test name pattern filtering

**Files:** `src/runners/nodeRunner.js`, `src/core/describe.js`, `src/core/it.js`

**Design:**
- `codi ./tests --grep "authentication"` runs only tests/suites matching the pattern.
- Supports regex: `codi ./tests --grep "/^should.*error$/i"`

---

## Phase 4: Cleanup & Maintenance

Low-risk tasks that reduce tech debt.

### 4.1 Remove unused `figlet` dependency

**Files:** `package.json:49`

`figlet` is declared but never imported anywhere. Remove it.

```
npm uninstall figlet
```

---

### 4.2 Remove legacy build scripts

**Files:** `scripts/build-browser.js`, `scripts/build-browser-advanced.js`, `scripts/build.js`

Only `scripts/build-esbuild.js` is used by `npm run build`. The others are legacy. Remove the files and their corresponding `package.json` scripts (`build:browser`, `build:browser:advanced`, `build:legacy`).

---

### 4.3 Remove duplicate lock file

**Files:** Either `pnpm-lock.yaml` or `package-lock.json`

Both exist. Pick one package manager and remove the other lock file. Add the removed one to `.gitignore`.

---

### 4.4 Consolidate documentation files

**Files:** `AUTOMATED_BUILDS_AND_PUBLISHING.md`, `BROWSER_TESTING.md`, `ESM_IMPORT_FIX.md`, `ESM_SH_COMPATIBILITY_FIX.md`, `IMPLEMENTATION_COMPLETE.md`, `IMPLEMENTATION_SUMMARY.md`, `validation-report.md`

Most of these read as implementation notes rather than user docs. Consolidate:
- Move user-facing content into the README or a `docs/` directory.
- Archive or delete implementation notes that are no longer relevant.

---

### 4.5 Improve README

**Files:** `README.md`

The current README covers basics but should be expanded with:
- How the `id`/`parentId` system works (the framework's most distinctive feature)
- Mocking examples (module mocking, HTTP mocking)
- Configuration reference (all `codi.json` options)
- How browser testing works and when to use it
- Project structure guide for test organization
- Comparison table vs Jest/Mocha/Vitest (what's different and why)

---

### 4.6 Extract shared `isDeepEqual` to avoid duplication

**Files:** Create `src/util/deepEqual.js`, update `src/assertions/assertEqual.js`, `src/assertions/assertNotEqual.js`, `src/assertions/browser.js`

Currently `isDeepEqual` is defined in `assertEqual.js` and duplicated in `browser.js`. Extract to a shared utility.

---

### 4.7 Extract version to a single source of truth

**Files:** Create `src/version.js`, update `src/_codi.js:12`, `src/_codi.browser.js:12`, `src/runners/browserRunner.js:483`, `package.json:3`

The version string is defined in at least 3 places (`_codi.js`, `_codi.browser.js`, browserRunner HTML template) and must be kept in sync with `package.json`. Extract to one file:

```js
// src/version.js
export const version = 'v1.0.39';
```

Import everywhere else. Optionally, read from `package.json` at build time.

---

## Implementation Order

Recommended sequence, respecting dependencies:

```
Phase 0 (Bug Fixes)
  0.6  describe error counting        (standalone)
  0.5  browserRunner version           (standalone)
  0.2  assertNotEqual deep equality    (depends on 4.6)
  0.3  isDeepEqual rewrite             (depends on 4.6)
  0.1  assertThrows async support      (standalone)
  0.4  async init race condition       (standalone)

Phase 4 (Cleanup - do early to simplify later work)
  4.6  Extract deepEqual utility
  4.7  Extract version constant
  4.1  Remove figlet
  4.2  Remove legacy build scripts
  4.3  Remove duplicate lock file

Phase 1 (Core Features)
  1.5  Input validation
  1.4  Eliminate browserRunner duplication  (do before adding features)
  1.1  Lifecycle hooks
  1.2  .only and .skip
  1.3  Per-test timeouts

Phase 2 (DX Improvements)
  2.1  Implicit lexical nesting
  2.5  Remove process.exit from library
  2.3  Expand assertion library
  2.2  Better error diffs
  2.4  TypeScript definitions

Phase 3 (Advanced)
  3.5  Grep/filter
  3.1  Watch mode
  3.4  Reporter plugins
  3.2  Coverage integration
  3.3  Parallel execution
```

---

## File Map

Quick reference of all source files and their roles:

| File | Role |
|------|------|
| `cli.js` | CLI entry point, shebang script |
| `src/testRunner.js` | CLI argument parsing, dispatches to runners |
| `src/_codi.js` | Main Node.js entry, exports everything |
| `src/_codi.browser.js` | Browser entry, no Node.js deps |
| `src/core/describe.js` | Suite definition |
| `src/core/it.js` | Test case definition |
| `src/state/TestState.js` | Singleton state, suite tree, reporting |
| `src/assertions/_assertions.js` | Barrel export for all assertions |
| `src/assertions/assertEqual.js` | Deep equality assertion |
| `src/assertions/assertNotEqual.js` | Inequality assertion (shallow) |
| `src/assertions/assertTrue.js` | Truthy assertion |
| `src/assertions/assertFalse.js` | Falsy assertion |
| `src/assertions/assertThrows.js` | Exception assertion (sync only) |
| `src/assertions/assertNoDuplicates.js` | Array uniqueness assertion |
| `src/assertions/browser.js` | Browser-compatible assertion copies |
| `src/runners/nodeRunner.js` | Node.js file discovery + execution |
| `src/runners/browserRunner.js` | Puppeteer headless browser runner |
| `src/runners/webRunner.js` | ESM-based web/Bun runner |
| `src/util/regex.js` | Directory exclusion pattern matching |
| `src/codepen/logging.js` | Console override for CodePen |
| `codi.json` | Framework configuration |
| `scripts/build-esbuild.js` | Active build script |
