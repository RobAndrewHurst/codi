#!/usr/bin/env node

/**
 * Build script for generating the browser IIFE bundle
 * This script reads the source modules and creates a self-contained
 * browser-compatible IIFE build at dist/codi.browser.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Read package.json for version info
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
);
const version = packageJson.version;

console.log(`🔨 Building browser IIFE bundle v${version}...`);

// Source files to include (in dependency order)
const sourceFiles = [
  'src/state/TestState.js',
  'src/assertions/browser.js',
  'src/core/describe.js',
  'src/core/it.js',
  'src/runners/webRunner.js',
  'src/codepen/logging.js',
];

// Read and process source files
function readSourceFile(filePath) {
  const fullPath = path.join(rootDir, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Remove imports and exports, keep only the implementation
  return (
    content
      // Remove import statements
      .replace(/^import\s+.*?from\s+['"][^'"]*['"];?\s*$/gm, '')
      // Remove export statements at the beginning of lines
      .replace(
        /^export\s+(?:default\s+)?(?:const|let|var|function|class|{)/gm,
        (match) => {
          return match.replace(/^export\s+(?:default\s+)?/, '');
        },
      )
      // Remove standalone export statements
      .replace(/^export\s+{\s*[^}]*\s*};?\s*$/gm, '')
      // Remove export default lines
      .replace(/^export\s+default\s+\w+;?\s*$/gm, '')
      // Clean up multiple empty lines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  );
}

// Generate the IIFE template
function generateIIFE() {
  const timestamp = new Date().toISOString();

  return `/**
 * Codi Test Framework - Browser IIFE Build
 * Version: ${version}
 * Generated: ${timestamp}
 * 
 * This is an automatically generated browser-compatible IIFE bundle.
 * Do not edit this file directly. Run 'npm run build:browser' to regenerate.
 */
(function(global) {
  'use strict';

  // Test state management for browser environment
  ${readSourceFile('src/state/TestState.js').replace('export const state = new TestState();', 'const state = new TestState();')}

  // Browser-compatible assertion functions
  ${readSourceFile('src/assertions/browser.js').replace('export default {', 'const assertions = {')}

  // Core test functions
  ${readSourceFile('src/core/describe.js').replace(/import\s+{\s*state\s*}\s+from\s+['"][^'"]*['"];?/g, '// state available from above')}

  ${readSourceFile('src/core/it.js').replace(/import\s+{\s*state\s*}\s+from\s+['"][^'"]*['"];?/g, '// state available from above')}

  // Web test runner functions
  ${readSourceFile('src/runners/webRunner.js').replace(/import\s+{\s*state\s*}\s+from\s+['"][^'"]*['"];?/g, '// state available from above')}

  // Console implementation for CodePen-like environments
  ${readSourceFile('src/codepen/logging.js')}

  // Create the main codi object
  const codi = {
    describe,
    it,
    state,
    runWebTests,
    runWebTestFile,
    runWebTestFunction,
    assertEqual: assertions.assertEqual,
    assertNotEqual: assertions.assertNotEqual,
    assertTrue: assertions.assertTrue,
    assertFalse: assertions.assertFalse,
    assertThrows: assertions.assertThrows,
    assertNoDuplicates: assertions.assertNoDuplicates,
    codepenLogging,
    version: 'v${version}'
  };

  // Expose to global scope
  global.codi = codi;
  global.describe = describe;
  global.it = it;
  global.assertEqual = assertions.assertEqual;
  global.assertNotEqual = assertions.assertNotEqual;
  global.assertTrue = assertions.assertTrue;
  global.assertFalse = assertions.assertFalse;
  global.assertThrows = assertions.assertThrows;
  global.assertNoDuplicates = assertions.assertNoDuplicates;

  // Export for module environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = codi;
  }

  // AMD support
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return codi;
    });
  }

  // Return for direct usage
  return codi;

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);`;
}

// Ensure dist directory exists
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Generate and write the bundle
try {
  const bundle = generateIIFE();
  const outputPath = path.join(distDir, 'codi.browser.js');

  fs.writeFileSync(outputPath, bundle, 'utf8');

  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`✅ Browser IIFE bundle generated successfully!`);
  console.log(`📁 Output: ${path.relative(rootDir, outputPath)}`);
  console.log(`📏 Size: ${sizeKB} KB`);
  console.log(`🔢 Version: v${version}`);

  // Validate the generated file
  if (bundle.includes('import ') || bundle.includes('export ')) {
    console.warn(
      '⚠️  Warning: Generated bundle still contains import/export statements',
    );
  }

  if (bundle.length < 1000) {
    console.warn('⚠️  Warning: Generated bundle seems too small');
  }
} catch (error) {
  console.error('❌ Error generating browser bundle:', error.message);
  process.exit(1);
}

// Generate source map info (basic)
const sourceMapInfo = {
  version: 3,
  file: 'codi.browser.js',
  sources: sourceFiles,
  generated: new Date().toISOString(),
  buildTool: 'codi-build-browser.js',
};

fs.writeFileSync(
  path.join(distDir, 'codi.browser.js.map'),
  JSON.stringify(sourceMapInfo, null, 2),
  'utf8',
);

console.log(`🗺️  Source map generated: dist/codi.browser.js.map`);
console.log(`\n🚀 Build complete! You can now use:`);
console.log(`   • <script src="./dist/codi.browser.js"></script>`);
console.log(
  `   • https://cdn.jsdelivr.net/npm/codi-test-framework@${version}/dist/codi.browser.js\n`,
);
