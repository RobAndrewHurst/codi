import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { state } from '../state/TestState.js';
import { excludePattern } from '../util/regex.js';

/**
 * Run tests in a headless browser environment
 * @async
 * @function runBrowserTests
 * @param {string} testDirectory - Directory containing tests
 * @param {boolean} [returnResults=false] - Whether to return results
 * @param {object} [codiConfig={}] - Configuration object
 * @param {object} [options={}] - Additional options
 * @returns {Promise<object|void>} Test results if returnResults is true
 */
export async function runBrowserTests(
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
    .filter((file) => file.endsWith('.mjs') || file.endsWith('.js'));

  if (codiConfig.excludeDirectories) {
    const matcher = excludePattern(codiConfig.excludeDirectories);
    testFiles = testFiles.filter((file) => !matcher(file));
  }

  // Filter out non-browser compatible tests for now
  testFiles = testFiles.filter((file) => file.includes('browser'));

  if (!options.quiet) {
    console.log(
      chalk.bold.magenta(
        `\nRunning browser tests in directory: ${chalk.underline(testDirectory)}`,
      ),
    );
    console.log(chalk.bold.magenta(`Found ${testFiles.length} test file(s)\n`));
  }

  let browser = null;
  let page = null;

  try {
    // Launch headless browser with CI-specific configuration
    const isCI =
      process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--allow-file-access-from-files',
        '--enable-local-file-accesses',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
      ],
    };

    // Add CI-specific options
    if (isCI) {
      launchOptions.args.push(
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-background-networking',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--no-first-run',
        '--mute-audio',
        '--hide-scrollbars',
        '--disable-logging',
        '--disable-gpu-logging',
        '--disable-translate',
        '--disable-ipc-flooding-protection',
      );
    }

    // Use system Chrome in CI if available
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    browser = await puppeteer.launch(launchOptions);

    page = await browser.newPage();

    // Set up console logging from browser
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();

      // Filter out Puppeteer internal messages and Chrome DevTools messages
      if (
        text.includes('Puppeteer') ||
        text.includes('DevTools') ||
        text.includes('chrome-extension') ||
        text.includes('Debugger attached') ||
        text.includes('Debugger detached')
      ) {
        return;
      }

      if (!options.quiet) {
        switch (type) {
          case 'log':
            console.log(text);
            break;
          case 'error':
            console.error(chalk.red(`Browser Error: ${text}`));
            break;
          case 'warn':
            console.warn(chalk.yellow(`Browser Warning: ${text}`));
            break;
          default:
            console.log(`[Browser ${type}] ${text}`);
        }
      }
    });

    // Handle page errors
    page.on('pageerror', (error) => {
      if (!options.quiet) {
        console.error(chalk.red('Page error:'), error.message);
      }
    });

    // Create and set HTML content with proper origin to enable localStorage
    const htmlContent = createTestHTML(testDirectory, testFiles, codiConfig);
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
    await page.goto(dataUrl, { waitUntil: 'networkidle0' });

    // Wait for tests to complete
    const results = await page
      .waitForFunction(() => window.testResults !== undefined, {
        timeout: 30000,
      })
      .then(() => page.evaluate(() => window.testResults));

    // Update state with results from browser
    state.passedTests = results.passedTests || 0;
    state.failedTests = results.failedTests || 0;
    state.suiteStack = results.suiteStack || {};

    if (results.error) {
      console.error(chalk.red('Browser test error:'), results.error);
    }
  } catch (error) {
    console.error(chalk.red('Browser test execution failed:'), error.message);
    state.failedTests++;
  } finally {
    // Clean up browser resources
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }

  state.printSummary();

  if (returnResults) {
    return {
      passedTests: state.passedTests,
      failedTests: state.failedTests,
      suiteStack: state.suiteStack,
      executionTime: state.getExecutionTime(),
    };
  }

  if (state.failedTests > 0) {
    console.log(chalk.red(`\n${state.failedTests} tests failed.`));
    process.exit(1);
  } else {
    console.log(chalk.green(`\n${state.passedTests} tests passed.`));
    process.exit(0);
  }
}

/**
 * Create HTML template for running tests in browser
 * @function createTestHTML
 * @param {string} testDirectory - Directory containing tests
 * @param {string[]} testFiles - Array of test file paths
 * @param {object} codiConfig - Configuration object
 * @returns {string} HTML content
 */
function createTestHTML(testDirectory, testFiles, codiConfig) {
  // Read all the test files and process them
  let testCode = '';

  for (const file of testFiles) {
    const filePath = path.join(testDirectory, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove imports and replace with global references
    content = content
      .replace(/import\s+{[^}]*}\s+from\s+['"][^'"]*_codi\.js['"];?\s*\n?/g, '')
      .replace(
        /import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]*_codi\.js['"];?\s*\n?/g,
        '',
      )
      .replace(/import\s+\w+\s+from\s+['"][^'"]*_codi\.js['"];?\s*\n?/g, '')
      .replace(/from\s+['"][^'"]*_codi\.js['"]/g, '');

    testCode += `\n// Test file: ${file}\n${content}\n`;
  }

  // Read preload files if specified
  let preloadCode = '';
  if (codiConfig.preload) {
    try {
      const preloadFiles = fs
        .readdirSync(codiConfig.preload, { recursive: true })
        .filter((file) => file.endsWith('.mjs') || file.endsWith('.js'));

      for (const file of preloadFiles) {
        const content = fs.readFileSync(
          path.join(codiConfig.preload, file),
          'utf8',
        );
        preloadCode += `\n// Preload file: ${file}\n${content}\n`;
      }
    } catch (error) {
      console.warn(
        chalk.yellow(`Warning: Could not load preload files: ${error.message}`),
      );
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Codi Browser Tests</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      padding: 20px;
      background: #1a1a1a;
      color: #ffffff;
    }
    #test-output {
      margin-top: 20px;
      white-space: pre-wrap;
      background: #000;
      padding: 15px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>🐶 Codi Browser Tests</h1>
  <div id="test-output"></div>

  <script>
    // Create a simple test state management system
    class BrowserTestState {
      constructor() {
        this.passedTests = 0;
        this.failedTests = 0;
        this.suiteStack = {};
        this.startTime = performance.now();
        this.pendingTests = new Set();
      }

      resetCounters() {
        this.passedTests = 0;
        this.failedTests = 0;
        this.suiteStack = {};
      }

      getExecutionTime() {
        return ((performance.now() - this.startTime) / 1000).toFixed(2);
      }

      pushSuite(suite) {
        const nestedSuite = {
          ...suite,
          children: [],
          tests: [],
          fullPath: suite.name
        };

        if (suite.parentId && this.suiteStack[suite.parentId]) {
          this.suiteStack[suite.parentId].children.push(nestedSuite);
        } else {
          this.suiteStack[suite.id] = nestedSuite;
        }

        return nestedSuite;
      }

      getSuite(parentId) {
        return this.searchSuite(parentId, this.suiteStack);
      }

      searchSuite(parentId, suiteStack) {
        function searchRecursively(suite) {
          if (suite.id === parentId) return suite;
          if (suite.children) {
            for (const child of suite.children) {
              const result = searchRecursively(child);
              if (result) return result;
            }
          }
          return null;
        }

        for (const suite of Object.values(suiteStack)) {
          const result = searchRecursively(suite);
          if (result) return result;
        }
        return null;
      }

      addTestToSuite(suite, test) {
        if (suite) {
          suite.tests.push(test);
        }
      }

      addTest(promise) {
        this.pendingTests.add(promise);
        promise.finally(() => this.pendingTests.delete(promise));
      }

      async waitForAll() {
        await Promise.all(Array.from(this.pendingTests));
      }
    }

    // Initialize test state
    window.testState = new BrowserTestState();

    // Assertion functions
    function isDeepEqual(obj1, obj2) {
      if (obj1 === obj2) return true;
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false;
      }
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      for (const key of keys1) {
        if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key])) return false;
      }
      return true;
    }

    window.assertEqual = function(actual, expected, message) {
      if (!isDeepEqual(actual, expected)) {
        const errorMsg = message || \`Expected \${JSON.stringify(actual)} to deeply equal \${JSON.stringify(expected)}\`;
        throw new Error(errorMsg);
      }
    };

    window.assertNotEqual = function(actual, expected, message) {
      if (actual === expected) {
        throw new Error(message || \`Expected \${actual} not to equal \${expected}\`);
      }
    };

    window.assertTrue = function(actual, message) {
      if (actual !== true) {
        const errorMsg = message || \`Expected \${actual} to be true\`;
        throw new Error(errorMsg);
      }
    };

    window.assertFalse = function(actual, message) {
      if (actual !== false) {
        throw new Error(message || \`Expected \${actual} to be false\`);
      }
    };

    window.assertThrows = function(callback, errorMessage, message) {
      try {
        callback();
        throw new Error(message || 'Expected an error to be thrown');
      } catch (error) {
        if (error.message !== errorMessage) {
          throw new Error(message || \`Expected error message to be \${errorMessage}, but got \${error.message}\`);
        }
      }
    };

    window.assertNoDuplicates = function(arr, message) {
      const duplicates = arr.filter((item, index) => arr.indexOf(item) !== index);
      if (duplicates.length > 0) {
        throw new Error(message || \`Duplicates found: \${duplicates}\`);
      }
    };

    // Core test functions
    window.describe = async function(params, callback) {
      const suite = {
        name: params.name,
        id: params.id,
        parentId: params.parentId,
        startTime: performance.now(),
      };

      const nestedSuite = window.testState.pushSuite(suite);

      const suitePromise = (async () => {
        try {
          await Promise.resolve(callback(suite));
        } catch (error) {
          console.error('Suite failed:', nestedSuite.fullPath, error);
        } finally {
          nestedSuite.duration = performance.now() - nestedSuite.startTime;
        }
      })();

      window.testState.addTest(suitePromise);
      return suitePromise;
    };

    window.it = async function(params, callback) {
      const suite = window.testState.getSuite(params.parentId);

      if (!suite) {
        throw new Error(\`test: \${params.name} needs to belong to a suite\`);
      }

      const test = {
        name: params.name,
        startTime: performance.now(),
      };

      const testPromise = (async () => {
        try {
          await Promise.resolve(callback());
          test.status = 'passed';
          test.duration = performance.now() - test.startTime;
          window.testState.passedTests++;
        } catch (error) {
          test.status = 'failed';
          test.error = { message: error.message || String(error) };
          test.duration = performance.now() - test.startTime;
          window.testState.failedTests++;
        } finally {
          window.testState.addTestToSuite(suite, test);
        }
      })();

      window.testState.addTest(testPromise);
      return testPromise;
    };

    // Create codi object
    window.codi = {
      describe: window.describe,
      it: window.it,
      state: window.testState,
      assertEqual: window.assertEqual,
      assertNotEqual: window.assertNotEqual,
      assertTrue: window.assertTrue,
      assertFalse: window.assertFalse,
      assertThrows: window.assertThrows,
      assertNoDuplicates: window.assertNoDuplicates,
      version: 'v1.0.38'
    };

    // Also make functions available directly
    window.describe = window.describe;
    window.it = window.it;
  </script>

  <script>
    // Preload code
    ${preloadCode}
  </script>

  <script>
    // Test execution
    (async function() {
      try {
        console.log('🐶 Starting browser tests...');

        // Execute test code
        ${testCode}

        // Wait for all tests to complete
        await window.testState.waitForAll();

        // Set results
        window.testResults = {
          passedTests: window.testState.passedTests,
          failedTests: window.testState.failedTests,
          suiteStack: window.testState.suiteStack,
          executionTime: window.testState.getExecutionTime()
        };

        console.log(\`Tests completed: \${window.testState.passedTests} passed, \${window.testState.failedTests} failed\`);

      } catch (error) {
        console.error('Test execution error:', error);
        window.testResults = {
          passedTests: 0,
          failedTests: 1,
          suiteStack: {},
          executionTime: 0,
          error: error.message
        };
      }
    })();
  </script>
</body>
</html>
  `;
}

/**
 * Run a single test file in browser
 * @async
 * @function runBrowserTestFile
 * @param {string} testFile - Path to test file
 * @returns {Promise<void>}
 */
export async function runBrowserTestFile(testFile) {
  const testDirectory = path.dirname(testFile);
  const fileName = path.basename(testFile);

  await runBrowserTests(
    testDirectory,
    false,
    {},
    {
      quiet: false,
      singleFile: fileName,
    },
  );
}

/**
 * Run a single test function in browser
 * @async
 * @function runBrowserTestFunction
 * @param {Function} testFn - Test function to run
 * @returns {Promise<object>} Test results
 */
export async function runBrowserTestFunction(testFn) {
  let browser = null;
  let page = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    page = await browser.newPage();

    // Set up console logging
    page.on('console', (msg) => console.log('Browser:', msg.text()));
    page.on('pageerror', (error) =>
      console.error('Page error:', error.message),
    );

    // Create minimal HTML for function execution
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Codi Test Function</title></head>
      <body>
        <script>
          // Initialize test environment
          ${createTestHTML('', [], {}).match(/<script>(.*?)<\/script>/s)[1]}

          // Execute test function
          (async function() {
            try {
              await (${testFn.toString()})();
              await window.testState.waitForAll();

              window.testResults = {
                passedTests: window.testState.passedTests,
                failedTests: window.testState.failedTests,
                suiteStack: window.testState.suiteStack
              };
            } catch (error) {
              console.error('Test function execution failed:', error);
              window.testResults = {
                passedTests: 0,
                failedTests: 1,
                suiteStack: {},
                error: error.message
              };
            }
          })();
        </script>
      </body>
      </html>
    `;

    await page.setContent(html);

    // Wait for results
    const results = await page
      .waitForFunction(() => window.testResults, { timeout: 30000 })
      .then(() => page.evaluate(() => window.testResults));

    return results;
  } catch (error) {
    console.error(
      chalk.red('Browser test function execution failed:'),
      error.message,
    );
    return {
      passedTests: 0,
      failedTests: 1,
      suiteStack: {},
      error: error.message,
    };
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}
