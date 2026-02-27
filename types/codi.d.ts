// Type definitions for codi-test-framework
// Project: https://github.com/RobAndrewHurst/codi
// Definitions by: Codi Contributors

declare module 'codi-test-framework' {
  // ── Suite API (passed to describe callback) ──────────────────────

  interface SuiteApi {
    name: string;
    id: string;
    parentId?: string;
    beforeAll(fn: () => void | Promise<void>): void;
    afterAll(fn: () => void | Promise<void>): void;
    beforeEach(fn: () => void | Promise<void>): void;
    afterEach(fn: () => void | Promise<void>): void;
  }

  // ── Describe params ──────────────────────────────────────────────

  interface DescribeParams {
    name: string;
    id: string;
    parentId?: string;
    _only?: boolean;
  }

  // ── It params ────────────────────────────────────────────────────

  interface ItParams {
    name: string;
    parentId: string;
    timeout?: number;
    _only?: boolean;
  }

  // ── Test results ─────────────────────────────────────────────────

  interface TestResults {
    passedTests: number;
    failedTests: number;
    suiteStack: Record<string, unknown>;
    executionTime?: string;
  }

  // ── describe ─────────────────────────────────────────────────────

  interface DescribeFunction {
    (
      params: DescribeParams,
      callback: (suite: SuiteApi) => void | Promise<void>,
    ): Promise<void>;
    (
      name: string,
      callback: (suite: SuiteApi) => void | Promise<void>,
    ): Promise<void>;
    skip(
      params: DescribeParams | string,
      callback?: (suite: SuiteApi) => void | Promise<void>,
    ): Promise<void>;
    only(
      params: DescribeParams | string,
      callback: (suite: SuiteApi) => void | Promise<void>,
    ): Promise<void>;
  }

  // ── it ───────────────────────────────────────────────────────────

  interface ItFunction {
    (params: ItParams, callback: () => void | Promise<void>): Promise<void>;
    (name: string, callback: () => void | Promise<void>): Promise<void>;
    skip(
      params: ItParams | string,
      callback?: () => void | Promise<void>,
    ): Promise<void>;
    only(
      params: ItParams | string,
      callback: () => void | Promise<void>,
    ): Promise<void>;
  }

  // ── TestState ────────────────────────────────────────────────────

  interface TestTracker {
    pendingTests: Set<Promise<unknown>>;
    addTest(promise: Promise<unknown>): void;
    waitForAll(): Promise<unknown[]>;
  }

  interface TestState {
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    suiteStack: Record<string, unknown>;
    options: Record<string, unknown>;
    hasOnly: boolean;

    setOptions(options: Record<string, unknown>): void;
    resetCounters(): void;
    startTimer(): void;
    getExecutionTime(): string;
    pushSuite(suite: Record<string, unknown>): Record<string, unknown>;
    getSuite(parentId: string): Record<string, unknown> | null;
    collectBeforeEach(
      suite: Record<string, unknown>,
    ): Array<() => void | Promise<void>>;
    collectAfterEach(
      suite: Record<string, unknown>,
    ): Array<() => void | Promise<void>>;
    addTestToSuite(
      suite: Record<string, unknown>,
      test: Record<string, unknown>,
    ): void;
    printSummary(): void;
    matchesGrep(name: string): boolean;
    testTracker: TestTracker;

    // Implicit nesting context
    generateId(): string;
    pushContext(id: string): void;
    popContext(): string | undefined;
    currentContext(): string | undefined;
  }

  // ── Assertion functions ──────────────────────────────────────────

  export function assertEqual(
    actual: unknown,
    expected: unknown,
    message?: string,
  ): void;
  export function assertNotEqual(
    actual: unknown,
    expected: unknown,
    message?: string,
  ): void;
  export function assertTrue(actual: unknown, message?: string): void;
  export function assertFalse(actual: unknown, message?: string): void;
  export function assertThrows(
    callback: () => void | Promise<void>,
    errorMessage?: string,
    message?: string,
  ): Promise<void>;
  export function assertNoDuplicates(arr: unknown[], message?: string): void;
  export function assertContains(
    haystack: string | unknown[],
    needle: unknown,
    message?: string,
  ): void;
  export function assertNotContains(
    haystack: string | unknown[],
    needle: unknown,
    message?: string,
  ): void;
  export function assertMatch(
    value: string,
    regex: RegExp,
    message?: string,
  ): void;
  export function assertInstanceOf(
    value: unknown,
    Constructor: new (...args: unknown[]) => unknown,
    message?: string,
  ): void;
  export function assertCloseTo(
    actual: number,
    expected: number,
    delta: number,
    message?: string,
  ): void;
  export function assertDeepContains(
    obj: Record<string, unknown>,
    subset: Record<string, unknown>,
    message?: string,
  ): void;
  export function assertType(
    value: unknown,
    type: string,
    message?: string,
  ): void;
  export function assertLength(
    value: string | unknown[],
    length: number,
    message?: string,
  ): void;

  // ── Core exports ─────────────────────────────────────────────────

  export const describe: DescribeFunction;
  export const it: ItFunction;
  export const state: TestState;
  export const version: string;
  export const ready: Promise<void>;

  // ── Run Options ──────────────────────────────────────────────────

  interface RunOptions {
    quiet?: boolean;
    grep?: string;
    reporter?: ReporterName;
    concurrency?: number;
  }

  // ── Reporter types ──────────────────────────────────────────────

  type ReporterName = 'console' | 'json' | 'junit' | 'tap' | 'dot';

  interface ReporterResults {
    suiteStack: Record<string, unknown>;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    executionTime: string;
  }

  interface Reporter {
    name: string;
    report(results: ReporterResults, options?: RunOptions): void;
  }

  export function getReporter(name?: ReporterName): Reporter;

  // ── Runner functions ─────────────────────────────────────────────

  export function runTests(
    testDirectory: string,
    returnResults?: boolean,
    codiConfig?: Record<string, unknown>,
    options?: RunOptions,
  ): Promise<TestResults>;

  export function runTestFunction(
    testFn: () => void | Promise<void>,
  ): Promise<TestResults>;

  export function runTestsParallel(
    testDirectory: string,
    returnResults?: boolean,
    codiConfig?: Record<string, unknown>,
    options?: RunOptions,
  ): Promise<TestResults>;

  export function runBrowserTests(
    testDirectory: string,
    returnResults?: boolean,
    codiConfig?: Record<string, unknown>,
    options?: RunOptions,
  ): Promise<TestResults>;

  export function runBrowserTestFile(testFile: string): Promise<void>;
  export function runBrowserTestFunction(
    testFn: () => void | Promise<void>,
  ): Promise<TestResults>;

  export function runWebTests(
    testFiles: string[],
    options?: RunOptions,
  ): Promise<TestResults>;

  export function runWebTestFile(
    testFile: string,
    options?: RunOptions,
  ): Promise<void>;
  export function runWebTestFunction(
    testFn: () => void | Promise<void>,
    options?: RunOptions,
  ): Promise<TestResults>;

  export function watch(testDirectory: string, argv: string[]): void;

  export function runCodi(): Promise<void>;

  export function codepenLogging(): void;

  // ── Config types ────────────────────────────────────────────────

  interface CoverageConfig {
    reporter?: string | string[];
    lines?: number;
    branches?: number;
    functions?: number;
    statements?: number;
    include?: string | string[];
    exclude?: string | string[];
    all?: boolean;
    checkCoverage?: boolean;
  }

  interface CodiConfig {
    excludeDirectories?: string[];
    preload?: string;
    timeout?: number;
    coverage?: CoverageConfig;
  }

  // ── Default export (codi object) ─────────────────────────────────

  interface Codi {
    describe: DescribeFunction;
    it: ItFunction;
    state: TestState;
    version: string;

    // Assertions
    assertEqual: typeof assertEqual;
    assertNotEqual: typeof assertNotEqual;
    assertTrue: typeof assertTrue;
    assertFalse: typeof assertFalse;
    assertThrows: typeof assertThrows;
    assertNoDuplicates: typeof assertNoDuplicates;
    assertContains: typeof assertContains;
    assertNotContains: typeof assertNotContains;
    assertMatch: typeof assertMatch;
    assertInstanceOf: typeof assertInstanceOf;
    assertCloseTo: typeof assertCloseTo;
    assertDeepContains: typeof assertDeepContains;
    assertType: typeof assertType;
    assertLength: typeof assertLength;

    // Runners
    runTests: typeof runTests;
    runTestFunction: typeof runTestFunction;
    runTestsParallel: typeof runTestsParallel;
    runBrowserTests: typeof runBrowserTests;
    runBrowserTestFile: typeof runBrowserTestFile;
    runBrowserTestFunction: typeof runBrowserTestFunction;
    runWebTests: typeof runWebTests;
    runWebTestFile: typeof runWebTestFile;
    runWebTestFunction: typeof runWebTestFunction;

    // Utilities
    codepenLogging: typeof codepenLogging;

    // Mocking (Node.js only)
    mock: unknown;
    mockHttp: unknown;
  }

  export const codi: Codi;
  export default codi;
}

// Global augmentation for browser / globalThis usage
declare global {
  var codi: import('codi-test-framework').Codi;
}
