import { Worker } from 'node:worker_threads';
import chalk from 'chalk';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { state } from '../state/TestState.js';
import { excludePattern } from '../util/regex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerScript = path.join(__dirname, 'testWorker.js');

/**
 * Run test files in parallel using worker_threads.
 *
 * @param {string} testDirectory - Directory containing test files
 * @param {boolean} [returnResults=false] - Whether to return results
 * @param {object} [codiConfig={}] - Configuration object
 * @param {object} [options={}] - Runtime options (quiet, grep, reporter, concurrency)
 * @returns {Promise<object>} Merged test results
 */
export async function runTestsParallel(
  testDirectory,
  returnResults = false,
  codiConfig = {},
  options = {},
) {
  state.resetCounters();
  state.startTimer();
  state.setOptions(options);

  let testFiles = fs
    .readdirSync(testDirectory, { recursive: true })
    .filter((file) => file.endsWith('.mjs'));

  if (codiConfig.excludeDirectories) {
    const matcher = excludePattern(codiConfig.excludeDirectories);
    testFiles = testFiles.filter((file) => !matcher(file));
  }

  // Exclude browser-specific tests
  testFiles = testFiles.filter((file) => !file.includes('browser'));

  // Resolve to absolute paths
  testFiles = testFiles.map((file) => path.resolve(testDirectory, file));

  // Handle preload files sequentially in the main thread first
  if (codiConfig.preload) {
    const preloadFiles = fs
      .readdirSync(codiConfig.preload, { recursive: true })
      .filter((file) => file.endsWith('.mjs'));

    for (const file of preloadFiles) {
      const filePath = path.resolve(codiConfig.preload, file);
      try {
        await import(`file://${filePath}`);
      } catch (error) {
        console.error(chalk.red(`Error in preload file ${filePath}:`));
        console.error(chalk.red(error.stack));
      }
    }
  }

  const concurrency = options.concurrency || Math.max(1, os.cpus().length - 1);

  if (!options.quiet) {
    console.log(
      chalk.bold.magenta(
        `\nRunning tests in parallel (${concurrency} workers): ${chalk.underline(testDirectory)}`,
      ),
    );
    console.log(chalk.bold.magenta(`Found ${testFiles.length} test file(s)\n`));
  }

  // Build serializable worker options (no regex, no functions)
  const workerOptions = {
    quiet: options.quiet || false,
    grep: options.grep || undefined,
    reporter: options.reporter || undefined,
  };

  // Run workers with concurrency limit
  const results = await runWorkerPool(testFiles, workerOptions, concurrency);

  // Merge all worker results into the main state
  for (const result of results) {
    state.passedTests += result.passedTests;
    state.failedTests += result.failedTests;
    state.skippedTests += result.skippedTests;

    // Merge suite stacks
    for (const [id, suite] of Object.entries(result.suiteStack)) {
      state.suiteStack[id] = suite;
    }
  }

  state.printSummary();

  return {
    passedTests: state.passedTests,
    failedTests: state.failedTests,
    skippedTests: state.skippedTests,
    suiteStack: state.suiteStack,
    executionTime: state.getExecutionTime(),
  };
}

/**
 * Run a pool of workers with a concurrency limit.
 * @param {string[]} testFiles
 * @param {object} options
 * @param {number} concurrency
 * @returns {Promise<object[]>}
 */
function runWorkerPool(testFiles, options, concurrency) {
  return new Promise((resolve) => {
    const results = [];
    let nextIndex = 0;
    let running = 0;

    function startNext() {
      if (nextIndex >= testFiles.length) {
        if (running === 0) {
          resolve(results);
        }
        return;
      }

      const testFile = testFiles[nextIndex++];
      running++;

      const worker = new Worker(workerScript, {
        workerData: { testFile, options },
        // Propagate execArgv for --experimental-test-module-mocks etc.
        execArgv: process.execArgv,
      });

      worker.on('message', (msg) => {
        results.push(msg);
      });

      worker.on('error', (err) => {
        results.push({
          testFile,
          passedTests: 0,
          failedTests: 1,
          skippedTests: 0,
          suiteStack: {},
          error: { message: err.message, stack: err.stack },
        });
      });

      worker.on('exit', () => {
        running--;
        startNext();
      });

      // Start more workers up to concurrency limit
      if (running < concurrency && nextIndex < testFiles.length) {
        startNext();
      }
    }

    // Kick off initial workers
    const initialBatch = Math.min(concurrency, testFiles.length);
    for (let i = 0; i < initialBatch; i++) {
      startNext();
    }

    // Handle edge case: no test files
    if (testFiles.length === 0) {
      resolve(results);
    }
  });
}
