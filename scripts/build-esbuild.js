#!/usr/bin/env node

/**
 * Simple ESBuild-based build script for Codi browser bundle
 *
 * This script uses esbuild to create a production-ready browser bundle
 * with proper IIFE format and global exports.
 */

import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Read package.json for version
const packageJson = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
);
const version = packageJson.version;

console.log(`🔨 Building Codi browser bundle v${version} with esbuild...`);

// Ensure dist directory exists
const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build configuration
const buildConfig = {
  entryPoints: [path.join(rootDir, 'src/_codi.browser.js')],
  bundle: true,
  format: 'iife',
  globalName: 'codi',
  outfile: path.join(rootDir, 'dist/codi.browser.js'),
  sourcemap: true,
  platform: 'browser',
  target: ['es2017'],
  minify: process.argv.includes('--minify'),
  banner: {
    js: `/**
 * Codi Test Framework - Browser Bundle
 * Version: v${version}
 * Generated: ${new Date().toISOString()}
 * Build tool: esbuild
 *
 * @license MIT
 */`,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  external: [], // Bundle everything
  alias: {
    // Alias chalk to empty object for browser compatibility
    chalk: path.join(__dirname, 'chalk-browser-stub.js'),
  },
};

// Create chalk browser stub
const chalkStubPath = path.join(__dirname, 'chalk-browser-stub.js');
const chalkStub = `
// Browser stub for chalk - provides no-op styling functions
export default {
  red: (text) => text,
  green: (text) => text,
  yellow: (text) => text,
  blue: (text) => text,
  magenta: (text) => text,
  cyan: (text) => text,
  white: (text) => text,
  gray: (text) => text,
  bold: {
    red: (text) => text,
    green: (text) => text,
    yellow: (text) => text,
    blue: (text) => text,
    magenta: (text) => text,
    cyan: (text) => text,
    white: (text) => text,
    underline: (text) => text
  },
  underline: (text) => text
};
`;

// Write chalk stub
fs.writeFileSync(chalkStubPath, chalkStub, 'utf8');

try {
  // Run the build
  const result = await build(buildConfig);

  // Clean up chalk stub
  fs.unlinkSync(chalkStubPath);

  // Get build stats
  const outputPath = buildConfig.outfile;
  const stats = fs.statSync(outputPath);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`✅ Build completed successfully!`);
  console.log(`📁 Output: ${path.relative(rootDir, outputPath)}`);
  console.log(
    `📏 Size: ${sizeKB} KB${buildConfig.minify ? ' (minified)' : ''}`,
  );
  console.log(`🔢 Version: v${version}`);

  if (result.warnings.length > 0) {
    console.warn(`⚠️  Build warnings:`);
    result.warnings.forEach((warning) => {
      console.warn(`   ${warning.text}`);
    });
  }

  // Post-process: Add global exports for browser compatibility
  let bundleContent = fs.readFileSync(outputPath, 'utf8');

  // Add global exports at the end of the IIFE
  const globalExports = `
  // Expose functions globally for convenience
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

  // Insert before the final return statement
  bundleContent = bundleContent.replace(
    /(\s+return\s+\w+;\s*}\)\(\);?\s*)$/,
    `${globalExports}$1`,
  );

  fs.writeFileSync(outputPath, bundleContent, 'utf8');

  console.log(`\n🚀 Usage examples:`);
  console.log(`   • <script src="dist/codi.browser.js"></script>`);
  console.log(
    `   • https://cdn.jsdelivr.net/npm/codi-test-framework@${version}/dist/codi.browser.js`,
  );
  console.log(
    `   • https://unpkg.com/codi-test-framework@${version}/dist/codi.browser.js`,
  );
  console.log(
    `\n📖 The bundle exposes both 'codi' global object and individual functions.`,
  );
} catch (error) {
  // Clean up chalk stub on error
  if (fs.existsSync(chalkStubPath)) {
    fs.unlinkSync(chalkStubPath);
  }

  console.error('❌ Build failed:', error.message);

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
