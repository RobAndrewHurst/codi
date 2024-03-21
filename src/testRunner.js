import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export function describe(description, callback) {
  console.log(chalk.bold.cyan(`\n${description}`));
  callback();
}

export function it(description, callback) {
  try {
    callback();
    console.log(chalk.green(`  ✅ ${description}`));
  } catch (error) {
    console.error(chalk.red(`  ⛔ ${description}`));
    console.error(chalk.red(`    ${error.message}`));
  }
}

// Assertion functions
export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${chalk.bold.yellow(actual)} to equal ${chalk.bold.yellow(expected)}`);
  }
}

export function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    throw new Error(message || `Expected ${chalk.bold.yellow(actual)} not to equal ${chalk.bold.yellow(expected)}`);
  }
}

export function assertTrue(actual, message) {
  if (actual !== true) {
    throw new Error(message || `Expected ${chalk.bold.yellow(actual)} to be true`);
  }
}

export function assertFalse(actual, message) {
  if (actual !== false) {
    throw new Error(message || `Expected ${chalk.bold.yellow(actual)} to be false`);
  }
}

export function assertThrows(callback, errorMessage, message) {
  try {
    callback();
    throw new Error(message || 'Expected an error to be thrown');
  } catch (error) {
    if (error.message !== errorMessage) {
      throw new Error(message || `Expected error message to be ${chalk.bold.yellow(errorMessage)}, but got ${chalk.bold.yellow(error.message)}`);
    }
  }
}

export function assertDeepEqual(actual, expected, message) {
  if (!isDeepEqual(actual, expected)) {
    throw new Error(message || `Expected ${chalk.bold.yellow(JSON.stringify(actual))} to deeply equal ${chalk.bold.yellow(JSON.stringify(expected))}`);
  }
}

// Helper function to compare objects deeply
function isDeepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

// Function to run a single test file
async function runTestFile(testFile) {
  try {
    // Import the test file as an ES module using an absolute path
    await import(path.resolve(testFile));
  } catch (error) {
    console.error(chalk.red(`\nError running test file ${chalk.underline(testFile)}:`));
    console.error(chalk.red(error.stack));
  }
}

// Function to run all test files in a directory
export function runTests(testDirectory) {
  // Read all files in the test directory
  const testFiles = fs.readdirSync(testDirectory, { recursive: true }).filter(file => file.endsWith('.mjs'));

  console.log(chalk.bold.magenta(`\nRunning tests in directory: ${chalk.underline(testDirectory)}`));
  console.log(chalk.bold.magenta(`Found ${testFiles.length} test file(s)\n`));

  // Run each test file
  testFiles.forEach(async (file) => {
    const testFile = path.join(testDirectory, file);
    await runTestFile(testFile);
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