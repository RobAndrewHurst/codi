import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { state } from '../state/TestState.js';
import { excludePattern } from '../util/regex.js';
import { version } from '../version.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the path to the built IIFE browser bundle.
 * Falls back gracefully if the bundle doesn't exist yet.
 * @returns {string|null} The bundle source code, or null if not found.
 */
function loadBrowserBundle() {
  const bundlePath = path.join(__dirname, '../../dist/codi.browser.js');
  try {
    return fs.readFileSync(bundlePath, 'utf8');
  } catch {
    console.warn(
      chalk.yellow(
        'Browser bundle not found at dist/codi.browser.js. Run "npm run build" first.',
      ),
    );
    return null;
  }
}

/**
 * Get Puppeteer launch options, with CI-specific tweaks.
 * @returns {object} Puppeteer launch options
 */
function getLaunchOptions() {
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

  if (isCI) {
    launchOptions.args.push(
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--disable-background-networking',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-default-browser-check',
      '--mute-audio',
      '--hide-scrollbars',
      '--disable-logging',
      '--disable-gpu-logging',
      '--disable-translate',
    );
  }

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  return launchOptions;
}

/**
 * Attach console and error listeners to a Puppeteer page.
 * @param {import('puppeteer').Page} page
 * @param {object} options
 */
function attachPageListeners(page, options) {
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

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

  page.on('pageerror', (error) => {
    if (!options.quiet) {
      console.error(chalk.red('Page error:'), error.message);
    }
  });
}

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

  // Filter to browser-specific test files
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
    browser = await puppeteer.launch(getLaunchOptions());
    page = await browser.newPage();
    attachPageListeners(page, options);

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
    if (page) await page.close();
    if (browser) await browser.close();
  }

  state.printSummary();

  return {
    passedTests: state.passedTests,
    failedTests: state.failedTests,
    suiteStack: state.suiteStack,
    executionTime: state.getExecutionTime(),
  };
}

/**
 * Create HTML template for running tests in browser.
 *
 * Uses the pre-built IIFE browser bundle (dist/codi.browser.js) to provide
 * the full codi API, instead of re-implementing it inline.
 *
 * @function createTestHTML
 * @param {string} testDirectory - Directory containing tests
 * @param {string[]} testFiles - Array of test file paths
 * @param {object} codiConfig - Configuration object
 * @returns {string} HTML content
 */
function createTestHTML(testDirectory, testFiles, codiConfig) {
  // Load the built IIFE bundle
  const bundleCode = loadBrowserBundle();
  if (!bundleCode) {
    throw new Error(
      'Browser bundle not found. Run "npm run build" before running browser tests.',
    );
  }

  // Read and process test files -- strip codi imports (they come from the bundle)
  let testCode = '';
  for (const file of testFiles) {
    const filePath = path.join(testDirectory, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove import statements that reference codi
    content = content
      .replace(
        /import\s+{[^}]*}\s+from\s+['"][^'"]*codi[^'"]*['"];?\s*\n?/g,
        '',
      )
      .replace(
        /import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]*codi[^'"]*['"];?\s*\n?/g,
        '',
      )
      .replace(/import\s+\w+\s+from\s+['"][^'"]*codi[^'"]*['"];?\s*\n?/g, '');

    testCode += `\n// Test file: ${file}\n${content}\n`;
  }

  // Read preload files if specified
  let preloadCode = '';
  if (codiConfig.preload) {
    try {
      const preloadFiles = fs
        .readdirSync(codiConfig.preload, { recursive: true })
        .filter((f) => f.endsWith('.mjs') || f.endsWith('.js'));

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

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Codi Browser Tests</title>
</head>
<body>
  <!-- Codi IIFE bundle: provides window.codi and all global assertion/test functions -->
  <script>
${bundleCode}
  </script>

  <script>
    // Preload code
    ${preloadCode}
  </script>

  <script>
    // Test execution
    (async function() {
      try {
        console.log('Starting browser tests...');

        ${testCode}

        // Wait for all pending tests to complete
        await codi.state.testTracker.waitForAll();

        // Collect results for the Node.js runner
        window.testResults = {
          passedTests: codi.state.passedTests,
          failedTests: codi.state.failedTests,
          suiteStack: codi.state.suiteStack,
          executionTime: codi.state.getExecutionTime()
        };

        console.log('Tests completed: ' + codi.state.passedTests + ' passed, ' + codi.state.failedTests + ' failed');

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
</html>`;
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
  const bundleCode = loadBrowserBundle();
  if (!bundleCode) {
    return {
      passedTests: 0,
      failedTests: 1,
      suiteStack: {},
      error: 'Browser bundle not found. Run "npm run build" first.',
    };
  }

  let browser = null;
  let page = null;

  try {
    browser = await puppeteer.launch(getLaunchOptions());
    page = await browser.newPage();
    attachPageListeners(page, { quiet: false });

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Codi Test Function</title></head>
<body>
  <script>
${bundleCode}
  </script>
  <script>
    (async function() {
      try {
        await (${testFn.toString()})();
        await codi.state.testTracker.waitForAll();

        window.testResults = {
          passedTests: codi.state.passedTests,
          failedTests: codi.state.failedTests,
          suiteStack: codi.state.suiteStack
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
</html>`;

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    await page.goto(dataUrl, { waitUntil: 'networkidle0' });

    const results = await page
      .waitForFunction(() => window.testResults !== undefined, {
        timeout: 30000,
      })
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
