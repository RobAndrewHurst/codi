import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import assertions from './assertions/_assertions.js';

// Assertion functions
export const assertEqual = assertions.assertEqual;
export const assertNotEqual = assertions.assertNotEqual;
export const assertTrue = assertions.assertTrue;
export const assertFalse = assertions.assertFalse;
export const assertThrows = assertions.assertThrows;
export const assertDeepEqual = assertions.assertDeepEqual;

let passedTests = 0;
let failedTests = 0;

export async function describe(description, callback) {
  console.log(chalk.bold.cyan(`\n${description}`));
  await callback();
}

export async function it(description, callback) {
  try {
    await callback();
    console.log(chalk.green(`  ✅ ${description}`));
    passedTests++;
  } catch (error) {
    console.error(chalk.red(`  ⛔ ${description}`));
    console.error(chalk.red(`    ${error.message}`));
    failedTests++;
  }
}

// Function to run a single test file
async function runTestFile(testFile) {
  try {
    // Convert the file path to a valid file:// URL on Windows
    const fileUrl = path.isAbsolute(testFile)
      ? `file://${testFile}`
      : `file://${path.resolve(testFile)}`;

    // Import the test file as an ES module using the file URL
    await import(fileUrl);
  } catch (error) {
    console.error(chalk.red(`\nError running test file ${chalk.underline(testFile)}:`));
    console.error(chalk.red(error.stack));
    failedTests++;
  }
}

// Function to run all test files in a directory
export async function runTests(testDirectory) {
  // Read all files in the test directory
  const testFiles = fs.readdirSync(testDirectory, { recursive: true }).filter(file => file.endsWith('.mjs'));

  console.log(chalk.bold.magenta(`\nRunning tests in directory: ${chalk.underline(testDirectory)}`));
  console.log(chalk.bold.magenta(`Found ${testFiles.length} test file(s)\n`));

  // Run each test file sequentially
  for (const file of testFiles) {
    const testFile = path.join(testDirectory, file);
    await runTestFile(testFile);
  }

  // Print the test summary
  console.log(chalk.bold.cyan('\nTest Summary:'));
  console.log(chalk.green(`  Passed: ${passedTests}`));
  console.log(chalk.red(`  Failed: ${failedTests}`));

  // Exit the process with the appropriate status code
  if (failedTests > 0) {
    console.log(chalk.red('\nSome tests failed.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\nAll tests passed.'));
    process.exit(0);
  }
}

// Function to run a single test file
async function runWebTestFile(testFile) {
  try {
      await import(testFile);
  } catch (error) {
      console.error(`Error running test file ${testFile}:`);
      console.error(error.stack);
      failedTests++;
  }
}

// Function to run all test files
export async function runWebTests(testFiles) {
  console.log(`Running ${testFiles.length} test file(s)`);

  // Run each test file sequentially
  for (const file of testFiles) {
    await runTestFile(file);
  }

  // Return a promise that resolves with the test results
  return new Promise((resolve) => {
    resolve({
      passed: passedTests,
      failed: failedTests
    });
  });
}

// CLI function
export function runCLI() {
  const testDirectory = process.argv[2];

  if (!testDirectory) {
    console.error(chalk.red('Please provide a test directory as an argument.'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('='.repeat(40)));
  console.log(chalk.bold.cyan('Running tests...'));
  console.log(chalk.bold.cyan('='.repeat(40)));

  runTests(testDirectory);
}