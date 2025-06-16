#!/usr/bin/env node

/**
 * Automated Build Script for Codi Test Framework
 *
 * This script builds the browser-compatible IIFE bundle using esbuild.
 * It automatically handles:
 * - Bundling all dependencies
 * - Creating IIFE format for browser usage
 * - Adding global exports
 * - Generating source maps
 * - Version management
 * - Build validation
 */

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const config = {
  minify: process.argv.includes('--minify'),
  watch: process.argv.includes('--watch'),
  verbose: process.argv.includes('--verbose'),
  skipValidation: process.argv.includes('--skip-validation'),
};

// Read package.json for version and metadata
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
);
const version = packageJson.version;

console.log(`🔨 Building Codi browser bundle v${version}...`);

// Ensure dist directory exists
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create a temporary chalk stub for browser compatibility
const chalkStubPath = path.join(__dirname, 'chalk-stub.js');
const chalkStub = `
// Browser compatibility stub for chalk
const identity = (text) => text;
const chalk = new Proxy({}, {
  get: () => identity
});
export default chalk;
`;

async function createBuild() {
  // Write temporary chalk stub
  fs.writeFileSync(chalkStubPath, chalkStub, 'utf8');

  const buildOptions = {
    entryPoints: [path.join(rootDir, 'src/_codi.browser.js')],
    bundle: true,
    format: 'iife',
    globalName: 'codi',
    outfile: path.join(rootDir, 'dist/codi.browser.js'),
    sourcemap: true,
    platform: 'browser',
    target: ['es2018'],
    minify: config.minify,
    legalComments: 'external',
    banner: {
      js: `/**
 * Codi Test Framework - Browser Bundle
 * Version: v${version}
 * Generated: ${new Date().toISOString()}
 * License: MIT
 * 
 * Automatically generated - do not edit directly
 * Run 'npm run build' to regenerate
 */`,
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    alias: {
      chalk: chalkStubPath,
    },
    external: [],
    metafile: true,
  };

  try {
    const result = await build(buildOptions);

    // Clean up temporary files
    if (fs.existsSync(chalkStubPath)) {
      fs.unlinkSync(chalkStubPath);
    }

    // Post-process the bundle
    await postProcessBundle();

    // Print build results
    printBuildResults(result);

    // Validate the build
    if (!config.skipValidation) {
      validateBuild();
    }

    return result;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(chalkStubPath)) {
      fs.unlinkSync(chalkStubPath);
    }
    throw error;
  }
}

async function postProcessBundle() {
  const bundlePath = path.join(rootDir, 'dist/codi.browser.js');
  let content = fs.readFileSync(bundlePath, 'utf8');

  // Add global exports for better browser compatibility
  const globalExports = `
  // Export functions to global scope for convenience
  if (typeof window !== 'undefined') {
    window.describe = codi.describe;
    window.it = codi.it;
    window.assertEqual = codi.assertEqual;
    window.assertNotEqual = codi.assertNotEqual;
    window.assertTrue = codi.assertTrue;
    window.assertFalse = codi.assertFalse;
    window.assertThrows = codi.assertThrows;
    window.assertNoDuplicates = codi.assertNoDuplicates;
  }`;

  // Insert global exports before the return statement
  content = content.replace(
    /(\s+return\s+[^;]+;\s*}\)\(\);?\s*)$/,
    `${globalExports}$1`,
  );

  // Add metadata to the codi object
  content = content.replace(
    /(version:\s*["']v[^"']+["'])/,
    `$1,
    build: {
      timestamp: '${new Date().toISOString()}',
      type: 'browser-iife',
      minified: ${config.minify}
    }`,
  );

  fs.writeFileSync(bundlePath, content, 'utf8');

  if (config.verbose) {
    console.log('✅ Post-processing completed');
  }
}

function printBuildResults(result) {
  const bundlePath = path.join(rootDir, 'dist/codi.browser.js');
  const stats = fs.statSync(bundlePath);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`\n✅ Build completed successfully!`);
  console.log(`📁 Output: dist/codi.browser.js`);
  console.log(`📏 Size: ${sizeKB} KB${config.minify ? ' (minified)' : ''}`);
  console.log(`🗺️  Source map: dist/codi.browser.js.map`);
  console.log(`🔢 Version: v${version}`);

  if (result.warnings && result.warnings.length > 0) {
    console.warn(`\n⚠️  Build warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning) => {
      console.warn(`   ${warning.text}`);
    });
  }

  console.log(`\n🚀 Usage:`);
  console.log(`   HTML: <script src="dist/codi.browser.js"></script>`);
  console.log(
    `   CDN:  https://cdn.jsdelivr.net/npm/codi-test-framework@${version}/dist/codi.browser.js`,
  );
  console.log(`   Test: Open test-browser-import.html in a browser\n`);
}

function validateBuild() {
  const bundlePath = path.join(rootDir, 'dist/codi.browser.js');
  const content = fs.readFileSync(bundlePath, 'utf8');

  const issues = [];

  // Check for problematic patterns
  if (content.includes('require(')) {
    issues.push('Bundle contains require() calls');
  }

  if (
    content.includes('process.') &&
    !content.includes('process.env.NODE_ENV')
  ) {
    issues.push('Bundle contains unhandled process references');
  }

  if (content.includes('__dirname') || content.includes('__filename')) {
    issues.push('Bundle contains Node.js path variables');
  }

  // Check for essential functions
  const requiredFunctions = [
    'describe',
    'it',
    'assertEqual',
    'assertTrue',
    'runWebTestFunction',
  ];
  const missingFunctions = requiredFunctions.filter(
    (fn) => !content.includes(fn),
  );
  if (missingFunctions.length > 0) {
    issues.push(`Missing required functions: ${missingFunctions.join(', ')}`);
  }

  // Check size constraints
  const sizeKB = content.length / 1024;
  if (sizeKB < 5) {
    issues.push('Bundle seems too small (< 5KB)');
  } else if (sizeKB > 500) {
    issues.push('Bundle seems too large (> 500KB)');
  }

  if (issues.length > 0) {
    console.warn(`\n⚠️  Validation issues found:`);
    issues.forEach((issue) => console.warn(`   • ${issue}`));
  } else {
    console.log(`✅ Bundle validation passed`);
  }
}

async function watchMode() {
  console.log('👀 Watch mode enabled - will rebuild on changes...');

  const watchOptions = {
    entryPoints: [path.join(rootDir, 'src/_codi.browser.js')],
    bundle: true,
    format: 'iife',
    globalName: 'codi',
    outfile: path.join(rootDir, 'dist/codi.browser.js'),
    sourcemap: true,
    platform: 'browser',
    target: ['es2018'],
    alias: {
      chalk: chalkStubPath,
    },
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error('❌ Rebuild failed:', error.message);
        } else {
          console.log('🔄 Rebuilt successfully');
          postProcessBundle().catch(console.error);
        }
      },
    },
  };

  await build(watchOptions);
}

// Show help
function showHelp() {
  console.log(`
Codi Build Script

Usage: node scripts/build.js [options]

Options:
  --minify           Minify the output bundle
  --watch            Watch for changes and rebuild automatically
  --verbose          Show detailed build information
  --skip-validation  Skip bundle validation
  --help             Show this help message

Examples:
  npm run build                    # Normal build
  npm run build -- --minify       # Minified build
  npm run build -- --watch        # Watch mode
  npm run build -- --verbose      # Verbose output
`);
}

// Main execution
async function main() {
  try {
    if (process.argv.includes('--help')) {
      showHelp();
      return;
    }

    // Write temporary chalk stub
    fs.writeFileSync(chalkStubPath, chalkStub, 'utf8');

    if (config.watch) {
      await watchMode();
    } else {
      await createBuild();
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);

    if (config.verbose && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    // Show esbuild specific errors
    if (error.errors && error.errors.length > 0) {
      console.error('\nBuild errors:');
      error.errors.forEach((err) => {
        console.error(`  ${err.text}`);
        if (err.location) {
          console.error(
            `    at ${err.location.file}:${err.location.line}:${err.location.column}`,
          );
        }
      });
    }

    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createBuild, validateBuild };
