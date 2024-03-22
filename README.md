# Codi Test Framework 🐶 

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Codi is a lightweight JavaScript test framework that allows you to write and run tests for your JavaScript code. It provides a simple and intuitive API for defining test suites and test cases, making it easy to ensure the correctness of your code. ✨

## Features ✅

- 📝 Simple and expressive API for writing tests
- 🏗️ Supports test suites and test cases
- 🔍 Provides assertion functions for comparing expected and actual values
- 🌈 Colorful output for better readability
- 🖥️ Supports running tests from the command line
- 🌐 Compatible with ECMAScript modules (ESM)

## Installation 📦

To use Codi in your project, you need to have Node.js installed. You can install Codi as a development dependency using npm:

```
npm install --save-dev codi-test-framework
```

## Usage 🛠️

### Writing Tests ✍️

To write tests using Codi, create a new test file with a `.mjs` extension. Use the `describe` function to define a test suite and the `it` function to define individual test cases.

Here's an example test file:

```javascript
import { describe, it, assertEqual } from 'codi-test-framework';

describe('Math operations', () => {
  it('should add two numbers correctly', () => {
    const result = 2 + 3;
    assertEqual(result, 5, 'Addition should work correctly');
  });

  it('should subtract two numbers correctly', () => {
    const result = 5 - 3;
    assertEqual(result, 2, 'Subtraction should work correctly');
  });
});
```

### Assertion Functions 🧪

Codi provides several assertion functions to compare expected and actual values:

- `assertEqual(actual, expected, message)`: Asserts that the actual value is equal to the expected value. ⚖️
- `assertNotEqual(actual, expected, message)`: Asserts that the actual value is not equal to the expected value. 🙅‍♂️
- `assertTrue(actual, message)`: Asserts that the actual value is true. ✅
- `assertFalse(actual, message)`: Asserts that the actual value is false. ❌
- `assertThrows(callback, errorMessage, message)`: Asserts that the provided callback function throws an error with the specified error message. 💥

### Running Tests 🏃‍♂️

To run the tests, use the `runTests` function and provide the directory containing your test files:

```javascript
import { runTests } from 'codi-test-framework';

runTests('./tests');
```

You can also run the tests from the command line using the `runCLI` function:

```
codi ./tests
```

## License 📄

This project is licensed under the [MIT License](LICENSE).

---

Feel free to contribute to Codi by opening issues or submitting pull requests. Happy testing! 😄