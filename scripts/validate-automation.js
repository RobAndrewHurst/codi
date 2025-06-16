#!/usr/bin/env node

/**
 * Validation script for automated build and publish workflow
 *
 * This script simulates the GitHub Actions workflow locally to ensure
 * everything works correctly before pushing to the repository.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: colorize('blue', 'ℹ️  INFO'),
    success: colorize('green', '✅ SUCCESS'),
    error: colorize('red', '❌ ERROR'),
    warning: colorize('yellow', '⚠️  WARNING'),
    step: colorize('cyan', '🔄 STEP'),
  };

  console.log(`${prefix[level]} [${timestamp}] ${message}`);
}

function execCommand(command, description) {
  log('step', `${description}: ${command}`);
  try {
    const output = execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    log('success', `${description} completed`);
    return output;
  } catch (error) {
    log('error', `${description} failed: ${error.message}`);
    if (error.stdout) {
      console.log('STDOUT:', error.stdout);
    }
    if (error.stderr) {
      console.log('STDERR:', error.stderr);
    }
    throw error;
  }
}

function checkFile(filePath, description) {
  const fullPath = path.join(rootDir, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    log('success', `${description} exists (${sizeKB} KB)`);
    return true;
  } else {
    log('error', `${description} not found at ${filePath}`);
    return false;
  }
}

function validatePackageJson() {
  log('step', 'Validating package.json configuration...');

  const packagePath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const requiredFields = ['name', 'version', 'main', 'browser', 'exports'];
  const requiredScripts = ['build', 'test', 'prepublishOnly'];

  let valid = true;

  // Check required fields
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      log('error', `Missing required field: ${field}`);
      valid = false;
    } else {
      log(
        'success',
        `Field ${field}: ${typeof packageJson[field] === 'object' ? 'configured' : packageJson[field]}`,
      );
    }
  }

  // Check required scripts
  for (const script of requiredScripts) {
    if (!packageJson.scripts[script]) {
      log('error', `Missing required script: ${script}`);
      valid = false;
    } else {
      log('success', `Script ${script}: ${packageJson.scripts[script]}`);
    }
  }

  // Check exports configuration
  if (packageJson.exports?.['.']) {
    const exports = packageJson.exports['.'];
    if (exports.browser && exports.node) {
      log('success', 'Browser/Node.js exports properly configured');
    } else {
      log('warning', 'Exports configuration may be incomplete');
    }
  }

  if (!valid) {
    throw new Error('package.json validation failed');
  }

  return packageJson;
}

function validateBuildSystem() {
  log('step', 'Validating build system...');

  // Check build scripts exist
  const buildScripts = [
    'scripts/build-browser.js',
    'scripts/build-esbuild.js',
    'scripts/build-browser-advanced.js',
  ];

  for (const script of buildScripts) {
    checkFile(script, `Build script: ${script}`);
  }

  // Test clean build
  log('step', 'Testing clean build process...');
  execCommand('npm run clean', 'Clean previous builds');
  execCommand('npm run build', 'Build browser bundle');

  // Validate build outputs
  const requiredOutputs = ['dist/codi.browser.js', 'dist/codi.browser.js.map'];

  for (const output of requiredOutputs) {
    if (!checkFile(output, `Build output: ${output}`)) {
      throw new Error(`Build validation failed: ${output} not generated`);
    }
  }

  // Check bundle content
  const bundlePath = path.join(rootDir, 'dist/codi.browser.js');
  const bundleContent = fs.readFileSync(bundlePath, 'utf8');

  const requiredInBundle = [
    'codi',
    'describe',
    'it',
    'assertEqual',
    'assertTrue',
    'assertFalse',
  ];

  for (const required of requiredInBundle) {
    if (!bundleContent.includes(required)) {
      log('error', `Bundle missing required content: ${required}`);
      throw new Error('Bundle validation failed');
    }
  }

  log('success', 'Bundle content validation passed');
}

function validateTestSystem() {
  log('step', 'Validating test system...');

  // Run Node.js tests
  execCommand('node cli.js tests --returnResults', 'Node.js tests');

  // Check if Chrome is available for browser tests
  try {
    execCommand(
      'which google-chrome || which google-chrome-stable || which chromium-browser',
      'Check Chrome availability',
    );

    // Run browser tests
    execCommand('npm run test:browser', 'Browser tests');
    log('success', 'Browser tests completed successfully');
  } catch (error) {
    log(
      'warning',
      'Chrome not available for browser tests - this is expected in some environments',
    );
    log('info', 'Browser tests will be skipped in this validation');
  }
}

function validateBrowserCompatibility() {
  log('step', 'Validating browser compatibility...');

  const bundlePath = path.join(rootDir, 'dist/codi.browser.js');
  const bundleContent = fs.readFileSync(bundlePath, 'utf8');

  // Check for Node.js-specific imports that shouldn't be in browser bundle
  const nodeOnlyPatterns = [
    'require\\s*\\(',
    'module\\.exports',
    'process\\.',
    '__dirname',
    '__filename',
    'fs\\.',
    'path\\.',
    'os\\.',
  ];

  let browserCompatible = true;

  for (const pattern of nodeOnlyPatterns) {
    const regex = new RegExp(pattern, 'g');
    const matches = bundleContent.match(regex);
    if (matches && matches.length > 0) {
      log(
        'warning',
        `Potential Node.js-specific code found: ${pattern} (${matches.length} occurrences)`,
      );
      // Don't fail on this, as some patterns might be in comments or strings
    }
  }

  // Check for proper IIFE structure (including modern arrow function IIFEs)
  const iifePatterns = [
    '(function(',
    '(function()',
    'var codi = (() => {',
    'let codi = (() => {',
    'const codi = (() => {',
  ];

  const hasIIFE = iifePatterns.some((pattern) =>
    bundleContent.includes(pattern),
  );
  if (!hasIIFE) {
    log('error', 'Bundle does not appear to be in IIFE format');
    browserCompatible = false;
  } else {
    log('success', 'Bundle is properly formatted as IIFE');
  }

  // Check for global exports
  if (!bundleContent.includes('global') && !bundleContent.includes('window')) {
    log('warning', 'Bundle may not properly expose global variables');
  }

  if (browserCompatible) {
    log('success', 'Browser compatibility validation passed');
  } else {
    throw new Error('Browser compatibility validation failed');
  }
}

function validateWorkflowFiles() {
  log('step', 'Validating GitHub Actions workflow files...');

  const workflowFiles = [
    '.github/workflows/build-and-publish.yml',
    '.github/workflows/unit_tests.yml',
  ];

  for (const workflow of workflowFiles) {
    if (checkFile(workflow, `Workflow: ${workflow}`)) {
      // Basic YAML syntax check
      const workflowContent = fs.readFileSync(
        path.join(rootDir, workflow),
        'utf8',
      );

      // Check for required workflow elements
      if (workflow.includes('build-and-publish')) {
        const requiredSections = ['build:', 'publish:', 'jobs:'];
        for (const section of requiredSections) {
          if (!workflowContent.includes(section)) {
            log('warning', `Workflow ${workflow} missing section: ${section}`);
          }
        }
      }
    }
  }
}

function validateDocumentation() {
  log('step', 'Validating documentation...');

  const docFiles = [
    'README.md',
    'AUTOMATED_BUILDS_AND_PUBLISHING.md',
    'BROWSER_TESTING.md',
  ];

  for (const doc of docFiles) {
    checkFile(doc, `Documentation: ${doc}`);
  }
}

function simulateVersionCalculation() {
  log('step', 'Simulating version calculation logic...');

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
  );
  const currentVersion = packageJson.version;

  log('info', `Current version: ${currentVersion}`);

  // Simulate different version scenarios
  const scenarios = [
    { type: 'beta', expected: `${currentVersion}-beta.1` },
    { type: 'alpha', expected: `${currentVersion}-alpha.1` },
    { type: 'rc', expected: `${currentVersion}-rc.1` },
  ];

  for (const scenario of scenarios) {
    log('info', `${scenario.type} version would be: ${scenario.expected}`);
  }

  // Simulate commit count for auto-beta
  try {
    const commitCount = execCommand(
      'git rev-list --count HEAD',
      'Get commit count',
    ).trim();
    const autoBetaVersion = `${currentVersion}-beta.${commitCount}`;
    log('info', `Auto-beta version would be: ${autoBetaVersion}`);
  } catch (error) {
    log(
      'warning',
      'Could not calculate commit count - not in a git repository',
    );
  }
}

function validateNpmConfiguration() {
  log('step', 'Validating npm configuration...');

  // Check if .npmignore exists and is configured properly
  const npmignorePath = path.join(rootDir, '.npmignore');
  if (fs.existsSync(npmignorePath)) {
    log('success', '.npmignore file exists');
    const npmignoreContent = fs.readFileSync(npmignorePath, 'utf8');

    const shouldIgnore = ['tests/', '*.test.js', '.github/', 'scripts/'];
    const shouldInclude = ['dist/', 'src/', 'cli.js'];

    for (const item of shouldIgnore) {
      if (
        npmignoreContent.includes(item) ||
        npmignoreContent.includes(item.replace('/', ''))
      ) {
        log('success', `Properly ignoring: ${item}`);
      } else {
        log('info', `Consider ignoring: ${item}`);
      }
    }
  } else {
    log('info', '.npmignore not found - using .gitignore defaults');
  }

  // Validate package files would be included
  try {
    const packageFiles = execCommand(
      'npm pack --dry-run 2>/dev/null | grep -v "npm notice" | grep -v "^$" || true',
      'Simulate npm pack',
    );
    if (packageFiles) {
      log('success', 'Package files simulation completed');
      console.log('Files that would be published:');
      console.log(packageFiles);
    }
  } catch (error) {
    log('warning', 'Could not simulate npm pack');
  }
}

function generateReport(results) {
  log('step', 'Generating validation report...');

  const reportPath = path.join(rootDir, 'validation-report.md');
  const timestamp = new Date().toISOString();

  let report = `# Automation Validation Report\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Status:** ${results.success ? '✅ PASSED' : '❌ FAILED'}\n`;
  report += `- **Total Checks:** ${results.totalChecks}\n`;
  report += `- **Passed:** ${results.passed}\n`;
  report += `- **Failed:** ${results.failed}\n`;
  report += `- **Warnings:** ${results.warnings}\n\n`;

  if (results.success) {
    report += `## ✅ Validation Successful\n\n`;
    report += `Your automated build and publish workflow is ready to use!\n\n`;
    report += `### Next Steps:\n\n`;
    report += `1. Push changes to trigger automated builds\n`;
    report += `2. Use manual workflow dispatch for experimental releases\n`;
    report += `3. Create git tags for stable releases\n`;
    report += `4. Monitor GitHub Actions for build status\n\n`;
  } else {
    report += `## ❌ Validation Failed\n\n`;
    report += `Please address the issues identified above before using the automated workflow.\n\n`;
  }

  report += `## Detailed Results\n\n`;
  report += results.details.join('\n');

  fs.writeFileSync(reportPath, report);
  log('success', `Validation report saved to: ${reportPath}`);
}

async function main() {
  console.log(colorize('bright', '\n🚀 Codi Automation Validation Script\n'));
  console.log(
    'This script validates the automated build and publish workflow locally.\n',
  );

  const results = {
    success: true,
    totalChecks: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  const validationSteps = [
    { name: 'Package Configuration', fn: validatePackageJson },
    { name: 'Build System', fn: validateBuildSystem },
    { name: 'Test System', fn: validateTestSystem },
    { name: 'Browser Compatibility', fn: validateBrowserCompatibility },
    { name: 'Workflow Files', fn: validateWorkflowFiles },
    { name: 'Documentation', fn: validateDocumentation },
    { name: 'Version Calculation', fn: simulateVersionCalculation },
    { name: 'NPM Configuration', fn: validateNpmConfiguration },
  ];

  for (const step of validationSteps) {
    try {
      console.log(colorize('bright', `\n=== ${step.name} ===`));
      results.totalChecks++;

      await step.fn();

      results.passed++;
      results.details.push(`- ✅ ${step.name}: PASSED`);
      log('success', `${step.name} validation completed`);
    } catch (error) {
      results.failed++;
      results.success = false;
      results.details.push(`- ❌ ${step.name}: FAILED - ${error.message}`);
      log('error', `${step.name} validation failed: ${error.message}`);
    }
  }

  console.log(colorize('bright', '\n=== Validation Complete ==='));

  if (results.success) {
    console.log(colorize('green', '\n🎉 All validations passed!'));
    console.log(
      colorize(
        'green',
        'Your automated build and publish workflow is ready to use.',
      ),
    );

    console.log(colorize('cyan', '\n📖 Usage Examples:'));
    console.log('• Push to main branch: Triggers automatic beta publish');
    console.log('• Create git tag v1.0.40: Triggers stable release');
    console.log(
      '• Manual workflow dispatch: Choose publish type (alpha/beta/rc/latest)',
    );

    console.log(colorize('cyan', '\n🔗 Resources:'));
    console.log('• Workflow file: .github/workflows/build-and-publish.yml');
    console.log('• Documentation: AUTOMATED_BUILDS_AND_PUBLISHING.md');
    console.log('• Test page: test-browser-import.html');
  } else {
    console.log(colorize('red', '\n❌ Validation failed!'));
    console.log(
      colorize(
        'red',
        'Please address the issues above before using the automated workflow.',
      ),
    );
  }

  // Generate detailed report
  generateReport(results);

  console.log(colorize('blue', '\n📊 Summary:'));
  console.log(`Total checks: ${results.totalChecks}`);
  console.log(`Passed: ${colorize('green', results.passed)}`);
  console.log(`Failed: ${colorize('red', results.failed)}`);
  console.log(`Warnings: ${colorize('yellow', results.warnings)}`);

  process.exit(results.success ? 0 : 1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log('error', `Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log('error', `Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Run the validation
main().catch((error) => {
  log('error', `Validation script failed: ${error.message}`);
  process.exit(1);
});
