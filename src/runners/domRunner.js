import chalk from 'chalk';
import fs from 'fs';
import { Window } from 'happy-dom';
import path from 'path';
import { ready } from '../_codi.js';
import { state } from '../state/TestState.js';
import { excludePattern } from '../util/regex.js';

/**
 * Install happy-dom globals onto globalThis so browser test files
 * can reference window, document, localStorage, etc. natively.
 *
 * Returns a cleanup function that removes the globals and closes the window.
 *
 * @returns {{ cleanup: () => Promise<void> }}
 */
function installDOMGlobals() {
  const window = new Window({ url: 'http://localhost' });

  // List of browser globals to expose
  const globals = [
    'window',
    'document',
    'navigator',
    'location',
    'history',
    'localStorage',
    'sessionStorage',
    'CustomEvent',
    'Event',
    'Element',
    'HTMLElement',
    'Node',
    'Text',
    'DocumentFragment',
    'MutationObserver',
    'DOMParser',
    'XMLSerializer',
    'getComputedStyle',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'Storage',
  ];

  const installed = [];

  // Expose window itself
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = window;
    installed.push('window');
  }

  // Expose individual globals from the window object
  for (const key of globals) {
    if (key === 'window') continue; // Already handled
    if (typeof globalThis[key] === 'undefined' && window[key] !== undefined) {
      globalThis[key] = window[key];
      installed.push(key);
    }
  }

  // fetch is already available in modern Node.js (18+), but bind to happy-dom's
  // if it provides one and the global one isn't set
  if (
    typeof globalThis.fetch === 'undefined' &&
    typeof window.fetch === 'function'
  ) {
    globalThis.fetch = window.fetch.bind(window);
    installed.push('fetch');
  }

  return {
    async cleanup() {
      for (const key of installed) {
        delete globalThis[key];
      }
      await window.happyDOM.close();
    },
  };
}

/**
 * Run a single test file in the DOM environment.
 * @param {string} testFile - Absolute path to the test file
 */
async function runTestFile(testFile) {
  try {
    const fileUrl = path.isAbsolute(testFile)
      ? `file://${testFile}`
      : `file://${path.resolve(testFile)}`;

    await import(fileUrl);
  } catch (error) {
    console.error(
      chalk.red(
        `\nError running browser test file ${chalk.underline(testFile)}:`,
      ),
    );
    console.error(chalk.red(error.stack));
  }
}

/**
 * Run browser test files inside Node.js using happy-dom for DOM globals.
 *
 * This avoids launching a real browser. For tests that require a real
 * Chromium environment, use `--browser` which invokes Puppeteer.
 *
 * @param {string} testDirectory - Directory containing tests
 * @param {boolean} [returnResults=false] - Whether to return results
 * @param {object} [codiConfig={}] - Configuration object
 * @param {object} [options={}] - Runtime options
 * @returns {Promise<object>} Test results
 */
export async function runDOMTests(
  testDirectory,
  returnResults = false,
  codiConfig = {},
  options = {},
) {
  await ready;

  // In unified mode, state is NOT reset here — the node runner has already
  // populated it. We only reset if running standalone (no prior node results).
  if (!options.skipReset) {
    state.resetCounters();
    state.startTimer();
  }
  state.setOptions(options);

  let testFiles = fs
    .readdirSync(testDirectory, { recursive: true })
    .filter((file) => file.endsWith('.mjs') || file.endsWith('.js'));

  if (codiConfig.excludeDirectories) {
    const matcher = excludePattern(codiConfig.excludeDirectories);
    testFiles = testFiles.filter((file) => !matcher(file));
  }

  // Filter to browser-specific test files
  testFiles = testFiles.filter((file) => file.includes('browser'));

  if (testFiles.length === 0) {
    return {
      passedTests: state.passedTests,
      failedTests: state.failedTests,
      skippedTests: state.skippedTests,
      suiteStack: state.suiteStack,
      executionTime: state.getExecutionTime(),
    };
  }

  if (!options.quiet) {
    console.log(
      chalk.bold.magenta(
        `\nRunning browser tests (DOM): ${chalk.underline(testDirectory)}`,
      ),
    );
    console.log(
      chalk.bold.magenta(`Found ${testFiles.length} browser test file(s)\n`),
    );
  }

  // Install DOM globals
  const { cleanup } = installDOMGlobals();

  try {
    for (const file of testFiles) {
      await runTestFile(path.join(testDirectory, file));
    }

    // Wait for all pending async tests to complete before cleanup.
    // Test files may contain describe/it calls that aren't awaited at
    // the top level — their promises are tracked by testTracker.
    await state.testTracker.waitForAll();
  } finally {
    await cleanup();
  }

  if (!options.skipSummary) {
    state.printSummary();
  }

  return {
    passedTests: state.passedTests,
    failedTests: state.failedTests,
    skippedTests: state.skippedTests,
    suiteStack: state.suiteStack,
    executionTime: state.getExecutionTime(),
  };
}

/**
 * Check whether a test directory contains any browser test files.
 *
 * @param {string} testDirectory
 * @param {object} [codiConfig={}]
 * @returns {boolean}
 */
export function hasBrowserTests(testDirectory, codiConfig = {}) {
  let testFiles = fs
    .readdirSync(testDirectory, { recursive: true })
    .filter((file) => file.endsWith('.mjs') || file.endsWith('.js'));

  if (codiConfig.excludeDirectories) {
    const matcher = excludePattern(codiConfig.excludeDirectories);
    testFiles = testFiles.filter((file) => !matcher(file));
  }

  return testFiles.some((file) => file.includes('browser'));
}
