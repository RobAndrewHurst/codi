import fs from 'fs';
import path from 'path';

export function describe(description, callback) {
    console.log(description);
    callback();
}

export function it(description, callback) {
    try {
        callback();
        console.log(`  ✓ ${description}`);
    } catch (error) {
        console.error(`  ✕ ${description}`);
        console.error(`    ${error.message}`);
    }
}

// Assertion functions
export function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${actual} to equal ${expected}`);
    }
}

export function assertNotEqual(actual, expected, message) {
    if (actual === expected) {
        throw new Error(message || `Expected ${actual} not to equal ${expected}`);
    }
}

export function assertTrue(actual, message) {
    if (actual !== true) {
        throw new Error(message || `Expected ${actual} to be true`);
    }
}

export function assertFalse(actual, message) {
    if (actual !== false) {
        throw new Error(message || `Expected ${actual} to be false`);
    }
}

export function assertThrows(callback, errorMessage, message) {
    try {
        callback();
        throw new Error(message || 'Expected an error to be thrown');
    } catch (error) {
        if (error.message !== errorMessage) {
            throw new Error(message || `Expected error message to be "${errorMessage}", but got "${error.message}"`);
        }
    }
}

// Function to run a single test file
async function runTestFile(testFile) {
    try {
      // Import the test file as an ES module using an absolute path
      await import(path.resolve(testFile));
    } catch (error) {
      console.error(`Error running test file ${testFile}:`, error);
    }
  }
  
  // Function to run all test files in a directory
  export function runTests(testDirectory) {
    // Read all files in the test directory
    const testFiles = fs.readdirSync(testDirectory, { recursive: true }).filter(file => file.endsWith('.mjs'));
  
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
        console.error('Please provide a test directory as an argument.');
        process.exit(1);
    }

    runTests(testDirectory);
}