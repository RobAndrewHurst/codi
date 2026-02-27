# Codi Test Framework

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![example workflow](https://github.com/RobAndrewHurst/codi/actions/workflows/unit_tests.yml/badge.svg)

Codi is a lightweight JavaScript test framework with a simple API for defining test suites and test cases. It runs in Node.js and the browser, ships with 14 assertion functions, lifecycle hooks, multiple reporters, watch mode, parallel execution, and code coverage — all with zero config.

## Installation

```bash
npm install --save-dev codi-test-framework
```

## Quick Start

Create a test file with a `.mjs` extension:

```js
import { describe, it, assertEqual, assertTrue } from 'codi-test-framework';

describe('Math operations', () => {
  it('should add two numbers', () => {
    assertEqual(2 + 3, 5);
  });

  it('should compare objects deeply', () => {
    assertEqual({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] });
  });

  it('should check truthiness', () => {
    assertTrue(10 > 5, 'Ten should be greater than five');
  });
});
```

Run it:

```bash
npx codi ./tests
```

## Writing Tests

### `describe` — Test Suites

Group related tests with `describe`. Suites can be nested.

**Implicit style** (recommended for most cases):

```js
describe('User service', () => {
  describe('create', () => {
    it('should create a user', () => { /* ... */ });
  });

  describe('delete', () => {
    it('should delete a user', () => { /* ... */ });
  });
});
```

**Explicit style** (uses `id`/`parentId` for linking suites across files or functions):

```js
describe({ name: 'User service', id: 'user_svc' }, () => {
  describe({ name: 'create', id: 'user_create', parentId: 'user_svc' }, () => {
    it({ name: 'should create a user', parentId: 'user_create' }, () => {
      /* ... */
    });
  });
});
```

The explicit style is useful when tests are spread across multiple functions or files, since a test in any function can attach itself to a suite by its `parentId`.

Both styles can be mixed freely.

### `it` — Test Cases

```js
// Implicit (inside a describe block)
it('should work', () => {
  assertEqual(1, 1);
});

// Explicit
it({ name: 'should work', parentId: 'suite_id' }, () => {
  assertEqual(1, 1);
});

// Async
it('should fetch data', async () => {
  const data = await fetchData();
  assertEqual(data.status, 200);
});
```

### Per-Test Timeout

Tests time out after 5 seconds by default. Override per-test:

```js
it({ name: 'slow operation', parentId: 'suite', timeout: 15000 }, async () => {
  await longRunningTask();
});
```

Or set a global default in `codi.json`:

```json
{
  "timeout": 10000
}
```

### `.skip` and `.only`

```js
describe.skip('Disabled suite', () => {
  it('this will not run', () => { /* ... */ });
});

it.skip('disabled test', () => { /* ... */ });

describe.only('Only this suite runs', () => {
  it('focused test', () => { /* ... */ });
});

it.only('only this test runs', () => { /* ... */ });
```

Skipped tests appear with a skip icon in the output. When any `.only` is used, non-only tests are skipped.

### Lifecycle Hooks

Register hooks via the suite API object passed to the `describe` callback:

```js
describe('Database tests', (suite) => {
  let db;

  suite.beforeAll(async () => {
    db = await connectToDatabase();
  });

  suite.afterAll(async () => {
    await db.close();
  });

  suite.beforeEach(() => {
    db.beginTransaction();
  });

  suite.afterEach(() => {
    db.rollback();
  });

  it('should insert a record', async () => {
    await db.insert({ name: 'Codi' });
    const rows = await db.query('SELECT * FROM users');
    assertEqual(rows.length, 1);
  });
});
```

- `beforeAll` / `afterAll` — run once per suite.
- `beforeEach` / `afterEach` — run around every `it` in the suite. Hooks from ancestor suites are inherited: `beforeEach` runs outermost-first, `afterEach` runs innermost-first.

## Assertions

All assertions accept an optional `message` as the last argument.

| Assertion | Description |
|---|---|
| `assertEqual(actual, expected, msg?)` | Deep equality (objects, arrays, Map, Set, Date, RegExp, NaN, -0) |
| `assertNotEqual(actual, expected, msg?)` | Deep inequality |
| `assertTrue(value, msg?)` | Strict `=== true` |
| `assertFalse(value, msg?)` | Strict `=== false` |
| `assertThrows(fn, errorMsg?, msg?)` | Callback throws (supports async functions) |
| `assertNoDuplicates(array, msg?)` | Array has no duplicate entries |
| `assertContains(haystack, needle, msg?)` | String includes substring, or array includes element |
| `assertNotContains(haystack, needle, msg?)` | Inverse of `assertContains` |
| `assertMatch(string, regex, msg?)` | String matches a regular expression |
| `assertInstanceOf(value, Constructor, msg?)` | `value instanceof Constructor` |
| `assertCloseTo(actual, expected, delta, msg?)` | `Math.abs(actual - expected) <= delta` |
| `assertDeepContains(object, subset, msg?)` | Object contains all keys/values from subset (deep) |
| `assertType(value, type, msg?)` | `typeof value === type` |
| `assertLength(value, length, msg?)` | Array or string has expected `.length` |

### Examples

```js
// Deep equality with diff output on failure
assertEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } });

// Async error checking
await assertThrows(
  async () => { await fetchBadEndpoint(); },
  'Not Found',
);

// Floating-point comparison
assertCloseTo(0.1 + 0.2, 0.3, 0.001);

// Subset matching
assertDeepContains(
  { name: 'Codi', type: 'dog', age: 5 },
  { name: 'Codi', type: 'dog' },
);

// Type and length
assertType(42, 'number');
assertLength([1, 2, 3], 3);

// Contains
assertContains('hello world', 'world');
assertContains([1, 2, 3], 2);

// Regex
assertMatch('test-123', /^test-\d+$/);
```

## CLI Reference

```
codi <testDirectory> [options]
```

| Flag | Description |
|---|---|
| `--node-only` | Run only Node tests, skip browser test files |
| `--browser` | Run only browser tests in real Chromium (Puppeteer) |
| `--parallel` | Run test files in parallel using worker threads |
| `--watch` | Watch for file changes and re-run tests |
| `--coverage` | Run with code coverage via c8 |
| `--grep <pattern>` | Only run tests matching the pattern |
| `--reporter <name>` | Output format: `console`, `json`, `junit`, `tap`, `dot` |
| `--quiet` | Only show failures |
| `--config <path>` | Path to config file (default: `./codi.json`) |
| `--returnResults` | Return results object instead of exiting |
| `--version` | Print version |

### Examples

```bash
# Run all tests (Node + browser)
codi ./tests

# Node tests only
codi ./tests --node-only

# Browser tests only (real Chromium)
codi ./tests --browser

# Run in parallel
codi ./tests --parallel

# Watch mode
codi ./tests --watch

# Filter tests by name
codi ./tests --grep "authentication"
codi ./tests --grep "/^should.*error$/i"

# JUnit output for CI
codi ./tests --reporter junit > test-results.xml

# JSON output
codi ./tests --reporter json

# TAP output
codi ./tests --reporter tap

# Dot output (minimal, for large suites)
codi ./tests --reporter dot

# Only show failures
codi ./tests --quiet

# Code coverage
codi ./tests --coverage

# Combine flags
codi ./tests --grep "user" --reporter dot --quiet
```

## Reporters

### `console` (default)

Hierarchical tree with coloured pass/fail/skip indicators.

### `json`

Machine-readable JSON with stats and full suite/test details. Useful for parsing in CI pipelines.

### `junit`

JUnit XML format compatible with Jenkins, GitHub Actions, and other CI systems.

### `tap`

[TAP (Test Anything Protocol)](https://testanything.org/) version 13 output.

### `dot`

Minimal output — one character per test (`.` pass, `F` fail, `S` skip). Best for large test suites.

## Configuration

Create a `codi.json` in your project root:

```json
{
  "excludeDirectories": ["fixtures", "helpers"],
  "preload": "__preload",
  "timeout": 10000,
  "coverage": {
    "reporter": ["text", "lcov"],
    "lines": 80,
    "branches": 80,
    "functions": 80,
    "statements": 80,
    "include": ["src/**"],
    "exclude": ["tests/**", "scripts/**"],
    "all": true,
    "checkCoverage": true
  }
}
```

| Field | Type | Description |
|---|---|---|
| `excludeDirectories` | `string[]` | Directory names to skip when scanning for test files |
| `preload` | `string` | Directory of `.mjs` files to run before tests (setup, global mocks) |
| `timeout` | `number` | Default per-test timeout in milliseconds (default: 5000) |
| `coverage` | `object` | c8 coverage settings (used with `--coverage` flag) |

### Coverage Configuration

The `coverage` object maps directly to [c8 options](https://github.com/bcoe/c8):

| Field | Description |
|---|---|
| `reporter` | Coverage reporter(s): `"text"`, `"lcov"`, `"html"`, etc. |
| `lines` | Minimum line coverage percentage |
| `branches` | Minimum branch coverage percentage |
| `functions` | Minimum function coverage percentage |
| `statements` | Minimum statement coverage percentage |
| `include` | Glob pattern(s) for files to include |
| `exclude` | Glob pattern(s) for files to exclude |
| `all` | Include all files, even those not imported by tests |
| `checkCoverage` | Fail if coverage thresholds are not met |

## Browser Testing

Browser tests run alongside Node tests in a single command — no separate step required. Codi uses [happy-dom](https://github.com/nicedaytoday/happy-dom) to provide `window`, `document`, `localStorage`, DOM APIs, and other browser globals inside Node.js.

Name your browser test files with `browser` in the filename (e.g. `browser.test.mjs`). Codi auto-detects them:

- **Node test files** — any `.mjs` file without "browser" in the name
- **Browser test files** — any `.mjs` file with "browser" in the name

```bash
# Runs both Node and browser tests together
codi ./tests
```

```js
// browser.test.mjs
import { describe, it, assertEqual, assertTrue } from 'codi-test-framework';

describe('DOM Tests', () => {
  it('should create elements', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    assertEqual(div.tagName, 'DIV');
    assertEqual(div.textContent, 'Hello');
  });

  it('should have fetch', () => {
    assertTrue(typeof fetch !== 'undefined');
  });

  it('should use localStorage', () => {
    localStorage.setItem('key', 'value');
    assertEqual(localStorage.getItem('key'), 'value');
  });
});
```

### Run modes

| Command | What runs |
|---|---|
| `codi ./tests` | Node tests + browser tests (via happy-dom) |
| `codi ./tests --node-only` | Node tests only, skip browser files |
| `codi ./tests --browser` | Browser tests only, in real Chromium via Puppeteer |

Use `--browser` when you need a real browser engine (Canvas, WebGL, complex CSS, service workers). For DOM manipulation, `localStorage`, `fetch`, and most web APIs, the default happy-dom mode is faster and requires no browser binary.

## Mocking

### Module Mocking

Requires Node.js with `--experimental-test-module-mocks`:

```bash
node --experimental-test-module-mocks cli.js tests
```

```js
import { codi } from 'codi-test-framework';

// Mock a module
const mock = codi.mock.module('./myModule.js', {
  namedExports: {
    getData() {
      return 'mocked data';
    },
  },
});

describe('with mocked module', () => {
  it('should use the mock', async () => {
    const mod = await import('./myModule.js');
    assertEqual(mod.getData(), 'mocked data');
  });

  it('should restore', async () => {
    mock.restore();
    const mod = await import('./myModule.js');
    // Now uses the real implementation
  });
});
```

### HTTP Mocking

Mock HTTP requests using `undici`'s `MockAgent`:

```js
import { codi } from 'codi-test-framework';

describe('API tests', () => {
  it('should mock fetch', async () => {
    const mockAgent = new codi.mockHttp.MockAgent();
    codi.mockHttp.setGlobalDispatcher(mockAgent);

    const pool = mockAgent.get(new RegExp('http://localhost:3000'));
    pool.intercept({ path: '/api/users' }).reply(200, [{ name: 'Codi' }]);

    const response = await fetch('http://localhost:3000/api/users');
    assertEqual(response.status, 200);
    assertEqual(await response.json(), [{ name: 'Codi' }]);
  });
});
```

### HTTP Request/Response Mocking

Create mock Express-style request and response objects using `node-mocks-http`:

```js
import { codi } from 'codi-test-framework';

describe('Express handler', () => {
  it('should handle request', () => {
    const req = codi.mockHttp.createRequest({
      method: 'GET',
      url: '/api/users',
    });
    const res = codi.mockHttp.createResponse();

    myHandler(req, res);

    assertEqual(res.statusCode, 200);
  });
});
```

## Programmatic Usage

Use Codi programmatically instead of via CLI:

```js
import { runTests, runTestFunction, runTestsParallel } from 'codi-test-framework';

// Run all tests in a directory
const results = await runTests('./tests', true);
console.log(`${results.passedTests} passed, ${results.failedTests} failed`);

// Run a single test function
const results = await runTestFunction(myTestFunction);

// Run in parallel
const results = await runTestsParallel('./tests', true, {}, { concurrency: 4 });
```

## TypeScript Support

Codi ships with TypeScript definitions. Autocomplete and type checking work out of the box in editors that support `.d.ts` files.

```ts
import { describe, it, assertEqual } from 'codi-test-framework';

describe('typed test', () => {
  it('works with TypeScript', () => {
    const value: number = 42;
    assertEqual(value, 42);
  });
});
```

## Imports

All exports are available as named imports:

```js
// Named imports
import { describe, it, assertEqual, assertThrows } from 'codi-test-framework';

// Default export (codi object with all functions)
import codi from 'codi-test-framework';

// Named codi object
import { codi } from 'codi-test-framework';
```

## CDN / Browser Script

For browser usage without a bundler:

```html
<script src="https://cdn.jsdelivr.net/npm/codi-test-framework/dist/codi.browser.js"></script>
<script>
  const { describe, it, assertEqual } = codi;

  describe('Browser test', () => {
    it('works in the browser', () => {
      assertEqual(1 + 1, 2);
    });
  });
</script>
```

## License

[MIT](LICENSE)
