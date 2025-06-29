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

import { version } from './_codi.js';

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

  if (!quiet) {
    console.log(chalk.bold.cyan('='.repeat(40)));
    console.log(
      chalk.bold.cyan(`Running ${browser ? 'browser' : 'node'} tests...`),
    );
    console.log(chalk.bold.cyan('='.repeat(40)));
  }

  if (browser) {
    await runBrowserTests(testDirectory, returnResults, codiConfig, { quiet });
  } else {
    await nodeRunTests(testDirectory, returnResults, codiConfig, { quiet });
  }
}
