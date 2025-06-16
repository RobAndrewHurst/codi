# Codi Test Framework 🐶

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![example workflow](https://github.com/RobAndrewHurst/codi/actions/workflows/unit_tests.yml/badge.svg)
[![npm version](https://badge.fury.io/js/codi-test-framework.svg)](https://www.npmjs.com/package/codi-test-framework)

Codi is a modern, lightweight JavaScript test framework that runs everywhere - Node.js, browsers, and even in online code editors like CodePen. Built for the modern web with first-class ESM support and zero configuration required. ✨

## Features ✅

- 🌐 **Universal Runtime Support**: Runs in Node.js, browsers, and web environments
- 📝 **Simple and Expressive API**: Intuitive `describe` and `it` functions for writing tests
- 🔍 **Rich Assertion Library**: Comprehensive set of assertion functions for all testing needs
- 🌈 **Beautiful Output**: Colorful, readable test results with clear success/failure indicators
- 🖥️ **Powerful CLI**: Full-featured command-line interface with multiple execution modes
- ⚡ **Lightning Fast**: Optimized for speed with minimal overhead
- 🎯 **Browser Testing**: Full DOM testing capabilities with Puppeteer integration
- 🧪 **Mocking Support**: Built-in HTTP mocking and Node.js test mocking capabilities
- 🔧 **Zero Configuration**: Works out of the box, configure only what you need
- 📦 **ESM First**: Native ECMAScript modules support with backward compatibility
- 🎨 **CodePen Ready**: Special logging utilities for online code editor environments
- 🔄 **Flexible Test Organization**: Support for nested test suites and custom test IDs
- 📊 **Detailed Reporting**: Comprehensive test results with timing and failure details

## Installation 📦

**Requirements**: Node.js 22.0.0 or higher

Install Codi as a development dependency in your project:

```bash
npm install --save-dev codi-test-framework
```

Or use with other package managers:

```bash
# Using yarn
yarn add -D codi-test-framework

# Using pnpm
pnpm add -D codi-test-framework
```

## Quick Start 🚀

Create a test file (e.g., `tests/example.test.mjs`):

```javascript
import { describe, it, assertEqual, assertTrue } from 'codi-test-framework';

describe('Math operations', () => {
  it('should add two numbers correctly', () => {
    const result = 2 + 3;
    assertEqual(result, 5, 'Addition should work correctly');
  });

  it('should handle edge cases', () => {
    assertTrue(Number.isNaN(0 / 0), 'Division by zero should return NaN');
  });
});
```

Run your tests:

```bash
# Run Node.js tests
npx codi tests

# Run browser tests
npx codi tests --browser

# Run with custom config
npx codi tests --config ./my-config.json
```

## Core API 🛠️

### Test Organization

#### `describe(name, callback)` or `describe(options, callback)`

Creates a test suite to group related tests.

```javascript
// Simple usage
describe('User Authentication', () => {
  // tests go here
});

// Advanced usage with options
describe({ name: 'Database Operations', id: 'db_ops' }, () => {
  // tests go here
});
```

#### `it(name, callback)` or `it(options, callback)`

Defines an individual test case.

```javascript
// Simple usage
it('should validate user credentials', () => {
  // test implementation
});

// Advanced usage with options
it({ name: 'should handle async operations', parentId: 'db_ops' }, async () => {
  // async test implementation
});
```

### Assertion Functions 🧪

Codi provides a comprehensive set of assertion functions:

#### `assertEqual(actual, expected, message)`
Asserts that two values are equal using strict equality (`===`).

```javascript
assertEqual(2 + 2, 4, 'Math should work');
assertEqual('hello', 'hello', 'Strings should match');
```

#### `assertNotEqual(actual, expected, message)`
Asserts that two values are not equal.

```javascript
assertNotEqual(2 + 2, 5, 'Math should be correct');
```

#### `assertTrue(actual, message)`
Asserts that a value is truthy.

```javascript
assertTrue(true, 'Should be true');
assertTrue('hello', 'Non-empty strings are truthy');
assertTrue(42, 'Non-zero numbers are truthy');
```

#### `assertFalse(actual, message)`
Asserts that a value is falsy.

```javascript
assertFalse(false, 'Should be false');
assertFalse('', 'Empty strings are falsy');
assertFalse(0, 'Zero is falsy');
```

#### `assertThrows(callback, expectedMessage, message)`
Asserts that a function throws an error, optionally with a specific message.

```javascript
assertThrows(() => {
  throw new Error('Something went wrong');
}, 'Something went wrong', 'Should throw with correct message');

// Just check that it throws
assertThrows(() => {
  JSON.parse('invalid json');
}, undefined, 'Should throw parsing error');
```

#### `assertNoDuplicates(array, message)`
Asserts that an array contains no duplicate values.

```javascript
assertNoDuplicates([1, 2, 3, 4], 'Array should have unique values');
assertNoDuplicates(['a', 'b', 'c'], 'String array should be unique');
```

## Browser Testing 🌐

Codi provides full browser testing capabilities using Puppeteer under the hood.

### Running Browser Tests

```bash
# Run all tests in browser environment
npx codi tests --browser

# Run specific test file in browser
npx codi tests/dom.test.mjs --browser
```

### Browser Test Example

```javascript
import { describe, it, assertEqual, assertTrue } from 'codi-test-framework';

describe({ name: 'DOM Manipulation', id: 'dom_tests' }, () => {
  it({ name: 'should create and modify elements', parentId: 'dom_tests' }, () => {
    // Create element
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    div.className = 'test-element';

    // Add to DOM
    document.body.appendChild(div);

    // Test DOM state
    assertEqual(div.tagName, 'DIV');
    assertEqual(div.textContent, 'Hello World');
    assertTrue(document.querySelector('.test-element') !== null);

    // Cleanup
    document.body.removeChild(div);
  });

  it({ name: 'should handle events', parentId: 'dom_tests' }, () => {
    const button = document.createElement('button');
    button.textContent = 'Click me';

    let clicked = false;
    button.addEventListener('click', () => {
      clicked = true;
    });

    document.body.appendChild(button);
    button.click();

    assertTrue(clicked, 'Button click should trigger event');

    document.body.removeChild(button);
  });
});
```

### Advanced Browser Testing

Codi supports testing of modern web APIs:

```javascript
// Web Components
describe('Web Components', () => {
  it('should create custom elements', () => {
    class MyButton extends HTMLElement {
      connectedCallback() {
        this.innerHTML = '<button>Custom Button</button>';
      }
    }

    customElements.define('my-button', MyButton);
    const element = document.createElement('my-button');
    document.body.appendChild(element);

    assertTrue(element.querySelector('button') !== null);
    document.body.removeChild(element);
  });
});

// Canvas Testing
describe('Canvas Operations', () => {
  it('should draw on canvas', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 50, 50);

    const imageData = ctx.getImageData(25, 25, 1, 1);
    assertEqual(imageData.data[0], 255); // Red component
  });
});

// Intersection Observer
describe('Intersection Observer', () => {
  it('should observe element visibility', (done) => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      assertTrue(typeof entry.isIntersecting === 'boolean');
      observer.disconnect();
      document.body.removeChild(target);
    });

    observer.observe(target);
  });
});
```

## Mocking and HTTP Testing 🎭

Codi includes powerful mocking capabilities for both Node.js and HTTP testing.

### Node.js Mocking

```javascript
import { mock } from 'codi-test-framework';

describe('Function Mocking', () => {
  it('should mock functions', () => {
    const mockFn = mock.fn();
    mockFn.mockReturnValue('mocked result');

    const result = mockFn();
    assertEqual(result, 'mocked result');
    assertEqual(mockFn.mock.calls.length, 1);
  });
});
```

### HTTP Mocking

```javascript
import { mockHttp } from 'codi-test-framework';

describe('HTTP Testing', () => {
  it('should mock HTTP requests', () => {
    const { req, res } = mockHttp.createMocks({
      method: 'GET',
      url: '/test',
      headers: { 'content-type': 'application/json' }
    });

    assertEqual(req.method, 'GET');
    assertEqual(req.url, '/test');

    res.status(200).json({ success: true });
    assertEqual(res.statusCode, 200);
  });
});
```

## Configuration 🔧

Codi supports configuration via a `codi.json` file in your project root:

```json
{
  "excludeDirectories": ["node_modules", "dist", "build"],
  "preload": "__preload",
  "timeout": 5000,
  "browser": {
    "headless": true,
    "viewport": {
      "width": 1280,
      "height": 720
    }
  }
}
```

### Configuration Options

- `excludeDirectories`: Array of directory names to exclude from test discovery
- `preload`: Directory containing files to preload before running tests
- `timeout`: Global timeout for tests in milliseconds
- `browser`: Browser-specific configuration for Puppeteer

## CLI Options 💻

```bash
# Basic usage
npx codi <test-directory>

# Available options
npx codi tests --browser          # Run in browser environment
npx codi tests --quiet           # Suppress non-essential output
npx codi tests --returnResults   # Return results programmatically
npx codi tests --config ./config.json  # Use custom config file
npx codi --version              # Show version information
```

## Web Environment Support 🌍

Codi works seamlessly in web environments like CodePen, JSFiddle, and other online editors.

### CodePen Usage

```javascript
// Import from CDN
import { describe, it, assertEqual, codepenLogging } from 'https://esm.sh/codi-test-framework';

// Enable CodePen-friendly logging
codepenLogging.enable();

describe('CodePen Tests', () => {
  it('should work in CodePen', () => {
    assertEqual(2 + 2, 4, 'Math works in CodePen too!');
  });
});

// Run tests
codi.runWebTests();
```

### Direct Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>Codi Browser Tests</title>
</head>
<body>
  <script type="module">
    import { describe, it, assertEqual, runWebTests } from 'https://esm.sh/codi-test-framework';

    describe('Browser Tests', () => {
      it('should work in browser', () => {
        assertEqual(window.location.protocol, 'http:');
      });
    });

    runWebTests();
  </script>
</body>
</html>
```

## Advanced Usage 🚀

### Async Testing

```javascript
describe('Async Operations', () => {
  it('should handle promises', async () => {
    const result = await Promise.resolve('async result');
    assertEqual(result, 'async result');
  });

  it('should handle fetch requests', async () => {
    const response = await fetch('/api/data');
    assertTrue(response.ok, 'Response should be ok');
  });
});
```

### Test Organization with IDs

```javascript
describe({ name: 'User Management', id: 'user_mgmt' }, () => {
  describe({ name: 'Authentication', id: 'auth', parentId: 'user_mgmt' }, () => {
    it({ name: 'should login user', parentId: 'auth' }, () => {
      // test implementation
    });
  });

  describe({ name: 'Authorization', id: 'authz', parentId: 'user_mgmt' }, () => {
    it({ name: 'should check permissions', parentId: 'authz' }, () => {
      // test implementation
    });
  });
});
```

### Performance Testing

```javascript
describe('Performance Tests', () => {
  it('should measure execution time', () => {
    const start = performance.now();

    // Operation to measure
    for (let i = 0; i < 10000; i++) {
      Math.random();
    }

    const end = performance.now();
    const duration = end - start;

    assertTrue(duration >= 0, 'Duration should be positive');
    console.log(`Operation took ${duration} milliseconds`);
  });
});
```

## CI/CD Integration 🔄

Codi works great in continuous integration environments:

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Run Node.js tests
        run: npx codi tests --returnResults

      - name: Run Browser tests
        run: npx codi tests --browser --returnResults
```

### Other CI Platforms

Codi's `--returnResults` flag makes it easy to integrate with any CI platform that checks exit codes.

## Examples and Recipes 📚

Check out the `examples/` directory for more advanced usage patterns:

- **Advanced Browser Testing**: Complete examples of DOM, Canvas, Web Components testing
- **HTTP Mocking**: Comprehensive HTTP testing scenarios
- **Performance Testing**: Measuring and asserting on performance metrics
- **Accessibility Testing**: Testing ARIA attributes and keyboard navigation

## Migrating from Other Frameworks 🔄

### From Jest

```javascript
// Jest
describe('test suite', () => {
  test('test case', () => {
    expect(value).toBe(expected);
  });
});

// Codi
describe('test suite', () => {
  it('test case', () => {
    assertEqual(value, expected);
  });
});
```

### From Mocha

```javascript
// Mocha + Chai
describe('test suite', () => {
  it('test case', () => {
    expect(value).to.equal(expected);
  });
});

// Codi
describe('test suite', () => {
  it('test case', () => {
    assertEqual(value, expected);
  });
});
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

**Requirements**: Node.js 22.0.0 or higher

```bash
git clone https://github.com/RobAndrewHurst/codi.git
cd codi
npm install
npm run dev  # Build and run tests
```

### Running Tests

```bash
npm test        # Run Node.js tests
npm run test:browser  # Run browser tests
npm run test:all      # Run all tests
```

## License 📄

This project is licensed under the [MIT License](LICENSE).

## Changelog 📝

### v1.0.40-beta
- Enhanced browser testing capabilities
- Added comprehensive web API testing support
- Improved mocking system with HTTP testing
- Better error handling and reporting
- Performance optimizations
- Full CI/CD integration

### Previous Versions
See [GitHub Releases](https://github.com/RobAndrewHurst/codi/releases) for complete changelog.

---

**Made with ❤️ by [Rob Hurst](https://github.com/RobAndrewHurst)**

*Codi - Because testing should be simple, fast, and work everywhere.* 🐶
