import { execFileSync } from 'node:child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { runBrowserTests } from './runners/browserRunner.js';
// Import runTests directly to use in runCLI
import { runTests as nodeRunTests } from './runners/nodeRunner.js';

export {
  runBrowserTestFile,
  runBrowserTestFunction,
  runBrowserTests,
} from './runners/browserRunner.js';
// Runner exports - re-export everything
export { runTestFunction, runTests } from './runners/nodeRunner.js';
export { runTestsParallel } from './runners/parallelRunner.js';

import { version } from './version.js';

/**
 * CLI entry point for running tests
 * @function runCLI
 */
export async function runCodi() {
  const testDirectory = process.argv[2];
  const returnResults = process.argv.includes('--returnResults');
  const returnVersion = process.argv.includes('--version');
  const configPathIndex = process.argv.indexOf('--config');
  const quiet = process.argv.includes('--quiet');
  const browser = process.argv.includes('--browser');
  const watchMode = process.argv.includes('--watch');
  const coverageMode = process.argv.includes('--coverage');
  const parallel = process.argv.includes('--parallel');
  const grepIndex = process.argv.indexOf('--grep');
  const grep = grepIndex !== -1 ? process.argv[grepIndex + 1] : undefined;
  const reporterIndex = process.argv.indexOf('--reporter');
  const reporter =
    reporterIndex !== -1 ? process.argv[reporterIndex + 1] : undefined;

  let codiConfig = {};

  const configPath =
    configPathIndex !== -1
      ? process.argv[configPathIndex + 1]
      : path.join(process.cwd(), 'codi.json');

  if (returnVersion) {
    console.log(chalk.blue(`🐶 Woof! Woof!: ${chalk.green(version)}`));
    process.exit(0);
  }

  if (!testDirectory) {
    console.error(chalk.red('Please provide a test directory as an argument.'));
    process.exit(1);
  }

  // Load config early — needed by watch, coverage, and normal modes
  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    codiConfig = JSON.parse(fileContent);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    if (!quiet) {
      console.log(
        chalk.yellow(
          `No config file found at ${configPath}, proceeding with default settings`,
        ),
      );
    }
  }

  // Watch mode: delegate to the watcher and never return
  if (watchMode) {
    const { watch } = await import('./watcher.js');
    watch(testDirectory, process.argv);
    return; // watch() runs indefinitely
  }

  // Coverage mode: re-spawn with c8 wrapping
  if (coverageMode) {
    const c8Args = ['c8'];

    // Forward coverage config from codi.json if present
    if (codiConfig.coverage) {
      const cc = codiConfig.coverage;
      if (cc.reporter) {
        for (const r of [].concat(cc.reporter)) {
          c8Args.push('--reporter', r);
        }
      }
      if (cc.lines != null) c8Args.push('--lines', String(cc.lines));
      if (cc.branches != null) c8Args.push('--branches', String(cc.branches));
      if (cc.functions != null)
        c8Args.push('--functions', String(cc.functions));
      if (cc.statements != null)
        c8Args.push('--statements', String(cc.statements));
      if (cc.include) {
        for (const p of [].concat(cc.include)) {
          c8Args.push('--include', p);
        }
      }
      if (cc.exclude) {
        for (const p of [].concat(cc.exclude)) {
          c8Args.push('--exclude', p);
        }
      }
      if (cc.all) c8Args.push('--all');
      if (cc.checkCoverage) c8Args.push('--check-coverage');
    }

    // Re-run the same CLI without --coverage to avoid infinite recursion
    const childArgs = process.argv
      .slice(1)
      .filter((arg) => arg !== '--coverage');
    c8Args.push(process.execPath, ...process.execArgv, ...childArgs);

    try {
      execFileSync('npx', c8Args, {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'inherit',
      });
      process.exit(0);
    } catch {
      process.exit(1);
    }
  }

  const runOptions = { quiet, grep, reporter };

  if (!quiet) {
    const mode = browser ? 'browser' : parallel ? 'parallel' : 'node';
    console.log(chalk.bold.cyan('='.repeat(40)));
    console.log(chalk.bold.cyan(`Running ${mode} tests...`));
    if (grep) {
      console.log(chalk.bold.cyan(`Filtering tests matching: ${grep}`));
    }
    console.log(chalk.bold.cyan('='.repeat(40)));
  }

  let results;
  if (browser) {
    results = await runBrowserTests(
      testDirectory,
      returnResults,
      codiConfig,
      runOptions,
    );
  } else if (parallel) {
    const { runTestsParallel } = await import('./runners/parallelRunner.js');
    results = await runTestsParallel(
      testDirectory,
      returnResults,
      codiConfig,
      runOptions,
    );
  } else {
    results = await nodeRunTests(
      testDirectory,
      returnResults,
      codiConfig,
      runOptions,
    );
  }

  // When called from CLI, handle exit codes
  if (returnResults) {
    return results;
  }

  if (results.failedTests > 0) {
    console.log(chalk.red(`\n${results.failedTests} tests failed.`));
    process.exit(1);
  } else {
    console.log(chalk.green(`\n${results.passedTests} tests passed.`));
    process.exit(0);
  }
}
