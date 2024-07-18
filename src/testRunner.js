import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import assertions from './assertions/_assertions.js';
import { excludePattern } from './util/regex.js';
// Assertion functions
export const assertEqual = assertions.assertEqual;
export const assertNotEqual = assertions.assertNotEqual;
export const assertTrue = assertions.assertTrue;
export const assertFalse = assertions.assertFalse;
export const assertThrows = assertions.assertThrows;

let passedTests = 0;
let failedTests = 0;
let testResults = [];
let version = 'v0.0.26';

export async function describe(description, callback) {
  console.log(chalk.bold.cyan(`\n${description}`));
  const describe = {
    [description]: []
  }
  testResults.push(describe);
  await callback();
}

export async function it(description, callback) {
  const itObj = {
    [description]: []
  }

  const currentDescribeObj = testResults[testResults.length - 1];

  try {
    await callback();
    console.log(chalk.green(` ✅ ${description}`));
    itObj[description] = 'passed';
    passedTests++;
  } catch (error) {
    console.error(chalk.red(` ⛔ ${description}`));
    console.error(chalk.red(` ${error.message}`));
    itObj[description] = 'failed';
    failedTests++;
  }

  Object.values(currentDescribeObj)[0].push(itObj);
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
export async function runTests(testDirectory, returnResults = false, codiConfig) {
  // Read all files in the test directory
  const matcher = excludePattern(codiConfig.excludeDirectories);
  console.log(matcher);
  let testFiles = fs.readdirSync(testDirectory, { recursive: true }).filter(file => file.endsWith('.mjs'));
  console.log(testFiles);
  console.log(testFiles.filter(matcher));

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

  if (returnResults) {

    let results = {
      passedTests,
      failedTests,
      testResults
    };

    return results;
  }

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
    await runWebTestFile(file);
  }

  console.log(chalk.bold.cyan('\nTest Summary:'));
  console.log(chalk.green(`  Passed: ${passedTests}`));
  console.log(chalk.red(`  Failed: ${failedTests}`));

  return {
    passedTests,
    failedTests,
    testResults
  }
}

// CLI function
export async function runCLI() {
  const testDirectory = process.argv[2];
  const returnResults = process.argv.includes('--returnResults');
  const returnVersion = process.argv.includes('--version');

  let codiConfig = {};

  try {
    const currentDir = process.cwd();
    const codiFilePath = path.join(currentDir, 'codi.json');

    // await fs.access(codiFilePath);

    const codiFileContent = fs.readFileSync(codiFilePath, 'utf-8');
    codiConfig = JSON.parse(codiFileContent);
  }
  catch (err) {
    console.log(err);
  }

  if (returnVersion) {
    console.log(chalk.blue(`🐶 Woof! Woof!: ${chalk.green(version)}`));
    process.exit(0);
  }

  if (!testDirectory) {
    console.error(chalk.red('Please provide a test directory as an argument.'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('='.repeat(40)));
  console.log(chalk.bold.cyan('Running tests...'));
  console.log(chalk.bold.cyan('='.repeat(40)));

  console.log(codiConfig);
  runTests(testDirectory, returnResults, codiConfig);

}