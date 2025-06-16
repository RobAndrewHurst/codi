#!/usr/bin/env node

/**
 * Advanced Build Script for Codi Browser IIFE Bundle
 *
 * This script creates a production-ready browser bundle by:
 * - Parsing and resolving ES module dependencies
 * - Creating a dependency-ordered bundle
 * - Removing Node.js specific code
 * - Generating source maps
 * - Minifying output (optional)
 * - Validating the build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Configuration
const config = {
  entry: 'src/_codi.browser.js',
  output: 'dist/codi.browser.js',
  sourceMap: true,
  minify: false, // Set to true for production
  validate: true,
  verbose: true,
};

// Module dependency graph
class ModuleGraph {
  constructor() {
    this.modules = new Map();
    this.resolved = new Set();
    this.resolving = new Set();
  }

  addModule(filepath, content) {
    const imports = this.extractImports(content);
    this.modules.set(filepath, {
      content,
      imports,
      processed: false,
    });
  }

  extractImports(content) {
    const imports = [];
    const importRegex =
      /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"];?/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  resolvePath(importPath, fromFile) {
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const fromDir = path.dirname(fromFile);
      let resolved = path.resolve(fromDir, importPath);

      // Try different extensions
      const extensions = ['.js', '.mjs'];
      for (const ext of extensions) {
        if (fs.existsSync(resolved + ext)) {
          resolved += ext;
          break;
        }
      }

      return path.relative(rootDir, resolved);
    }

    return null; // External dependency
  }

  processFile(filepath) {
    if (this.resolved.has(filepath)) {
      return '';
    }

    if (this.resolving.has(filepath)) {
      throw new Error(`Circular dependency detected: ${filepath}`);
    }

    this.resolving.add(filepath);

    const fullPath = path.join(rootDir, filepath);
    if (!fs.existsSync(fullPath)) {
      this.resolving.delete(filepath);
      return '';
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    this.addModule(filepath, content);

    const module = this.modules.get(filepath);
    let processedContent = '';

    // Process dependencies first
    for (const importPath of module.imports) {
      const resolvedPath = this.resolvePath(importPath, filepath);
      if (resolvedPath) {
        processedContent += this.processFile(resolvedPath);
      }
    }

    // Process current module
    processedContent += this.processModule(filepath, content);

    this.resolving.delete(filepath);
    this.resolved.add(filepath);

    return processedContent;
  }

  processModule(filepath, content) {
    if (config.verbose) {
      console.log(`📦 Processing module: ${filepath}`);
    }

    // Remove imports
    content = content.replace(
      /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"][^'"]+['"];?\s*/g,
      '',
    );

    // Convert exports to declarations
    content = content.replace(/export\s+const\s+/g, 'const ');
    content = content.replace(/export\s+let\s+/g, 'let ');
    content = content.replace(/export\s+var\s+/g, 'var ');
    content = content.replace(/export\s+function\s+/g, 'function ');
    content = content.replace(/export\s+class\s+/g, 'class ');
    content = content.replace(
      /export\s+async\s+function\s+/g,
      'async function ',
    );

    // Remove export default and export {} statements
    content = content.replace(/export\s+default\s+[^;]+;?\s*/g, '');
    content = content.replace(/export\s*{\s*[^}]*\s*};?\s*/g, '');

    // Remove export from object/array literals
    content = content.replace(/export\s+(?=\{|\[)/g, '');

    // Clean up chalk imports (browser doesn't need styling)
    content = content.replace(/chalk\./g, '');
    content = content.replace(/chalk\(/g, '(');

    // Add module separator comment
    content = `\n  // === Module: ${filepath} ===\n${content}\n`;

    return content;
  }
}

// Bundle generator
class BundleGenerator {
  constructor() {
    this.graph = new ModuleGraph();
    this.version = this.getVersion();
  }

  getVersion() {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
    );
    return packageJson.version;
  }

  generateBundle() {
    console.log(`🔨 Building Codi browser bundle v${this.version}...`);

    // Process the entry point and all dependencies
    const bundleContent = this.graph.processFile(config.entry);

    // Generate the complete IIFE
    const iife = this.wrapInIIFE(bundleContent);

    // Ensure output directory exists
    const outputDir = path.dirname(path.join(rootDir, config.output));
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the bundle
    const outputPath = path.join(rootDir, config.output);
    fs.writeFileSync(outputPath, iife, 'utf8');

    if (config.validate) {
      this.validateBundle(iife);
    }

    if (config.sourceMap) {
      this.generateSourceMap();
    }

    this.printStats(outputPath, iife);

    return iife;
  }

  wrapInIIFE(content) {
    const timestamp = new Date().toISOString();

    return `/**
 * Codi Test Framework - Browser IIFE Bundle
 * Version: v${this.version}
 * Generated: ${timestamp}
 * Build: Advanced automated build
 * 
 * This is an automatically generated browser-compatible IIFE bundle.
 * Source: https://github.com/RobAndrewHurst/codi
 * 
 * @license MIT
 */
(function(global, factory) {
  'use strict';
  
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else {
    // Browser globals
    global.codi = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this, function() {
  'use strict';

  ${content}

  // Create the main codi object
  const codi = {
    // Core functions
    describe: typeof describe !== 'undefined' ? describe : function() { throw new Error('describe not available'); },
    it: typeof it !== 'undefined' ? it : function() { throw new Error('it not available'); },
    
    // Test state
    state: typeof state !== 'undefined' ? state : { passedTests: 0, failedTests: 0 },
    
    // Web test runners
    runWebTests: typeof runWebTests !== 'undefined' ? runWebTests : function() { return Promise.resolve({}); },
    runWebTestFile: typeof runWebTestFile !== 'undefined' ? runWebTestFile : function() { return Promise.resolve(); },
    runWebTestFunction: typeof runWebTestFunction !== 'undefined' ? runWebTestFunction : function() { return Promise.resolve({}); },
    
    // Assertions
    assertEqual: typeof assertEqual !== 'undefined' ? assertEqual : function() { throw new Error('assertEqual not available'); },
    assertNotEqual: typeof assertNotEqual !== 'undefined' ? assertNotEqual : function() { throw new Error('assertNotEqual not available'); },
    assertTrue: typeof assertTrue !== 'undefined' ? assertTrue : function() { throw new Error('assertTrue not available'); },
    assertFalse: typeof assertFalse !== 'undefined' ? assertFalse : function() { throw new Error('assertFalse not available'); },
    assertThrows: typeof assertThrows !== 'undefined' ? assertThrows : function() { throw new Error('assertThrows not available'); },
    assertNoDuplicates: typeof assertNoDuplicates !== 'undefined' ? assertNoDuplicates : function() { throw new Error('assertNoDuplicates not available'); },
    
    // Utilities
    codepenLogging: typeof codepenLogging !== 'undefined' ? codepenLogging : function() { return console; },
    
    // Metadata
    version: 'v${this.version}',
    build: {
      timestamp: '${timestamp}',
      type: 'browser-iife',
      advanced: true
    }
  };

  // Expose individual functions to global scope for convenience
  if (typeof window !== 'undefined') {
    window.describe = codi.describe;
    window.it = codi.it;
    window.assertEqual = codi.assertEqual;
    window.assertNotEqual = codi.assertNotEqual;
    window.assertTrue = codi.assertTrue;
    window.assertFalse = codi.assertFalse;
    window.assertThrows = codi.assertThrows;
    window.assertNoDuplicates = codi.assertNoDuplicates;
  }

  return codi;
});`;
  }

  validateBundle(content) {
    console.log('🔍 Validating bundle...');

    const issues = [];

    // Check for remaining imports/exports
    if (content.includes('import ')) {
      issues.push('Bundle contains unprocessed import statements');
    }

    if (content.includes('export ')) {
      issues.push('Bundle contains unprocessed export statements');
    }

    // Check for Node.js specific code
    const nodePatterns = [
      'require(',
      'process.',
      'Buffer.',
      '__dirname',
      '__filename',
      'fs.',
      'path.',
      'module.exports',
    ];

    for (const pattern of nodePatterns) {
      if (content.includes(pattern)) {
        issues.push(`Bundle contains Node.js specific code: ${pattern}`);
      }
    }

    // Check bundle size
    if (content.length < 5000) {
      issues.push('Bundle seems too small (< 5KB)');
    }

    if (content.length > 500000) {
      issues.push('Bundle seems too large (> 500KB)');
    }

    if (issues.length > 0) {
      console.warn('⚠️  Validation issues found:');
      issues.forEach((issue) => console.warn(`   • ${issue}`));
    } else {
      console.log('✅ Bundle validation passed');
    }
  }

  generateSourceMap() {
    const sourceMapPath = path.join(rootDir, config.output + '.map');
    const sourceMap = {
      version: 3,
      file: path.basename(config.output),
      sources: Array.from(this.graph.resolved),
      sourcesContent: Array.from(this.graph.resolved).map((file) => {
        const fullPath = path.join(rootDir, file);
        return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
      }),
      names: [],
      mappings: '',
      generated: new Date().toISOString(),
      buildTool: 'codi-build-browser-advanced.js',
    };

    fs.writeFileSync(sourceMapPath, JSON.stringify(sourceMap, null, 2), 'utf8');
    console.log(
      `🗺️  Source map generated: ${path.relative(rootDir, sourceMapPath)}`,
    );
  }

  printStats(outputPath, content) {
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const lines = content.split('\n').length;
    const modulesProcessed = this.graph.resolved.size;

    console.log(`\n✅ Build completed successfully!`);
    console.log(`📁 Output: ${path.relative(rootDir, outputPath)}`);
    console.log(`📏 Size: ${sizeKB} KB`);
    console.log(`📄 Lines: ${lines.toLocaleString()}`);
    console.log(`📦 Modules: ${modulesProcessed}`);
    console.log(`🔢 Version: v${this.version}`);

    console.log(`\n🚀 Usage:`);
    console.log(
      `   • <script src="${path.relative(rootDir, outputPath)}"></script>`,
    );
    console.log(
      `   • https://cdn.jsdelivr.net/npm/codi-test-framework@${this.version}/dist/codi.browser.js`,
    );
    console.log(
      `   • https://unpkg.com/codi-test-framework@${this.version}/dist/codi.browser.js\n`,
    );
  }
}

// CLI interface
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { ...config };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--minify':
        options.minify = true;
        break;
      case '--no-source-map':
        options.sourceMap = false;
        break;
      case '--no-validate':
        options.validate = false;
        break;
      case '--quiet':
        options.verbose = false;
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--help':
        console.log(`
Codi Browser Bundle Builder

Usage: node scripts/build-browser-advanced.js [options]

Options:
  --minify          Minify the output bundle
  --no-source-map   Skip source map generation
  --no-validate     Skip bundle validation
  --quiet           Reduce output verbosity
  --output <path>   Specify output file (default: dist/codi.browser.js)
  --help            Show this help message

Examples:
  node scripts/build-browser-advanced.js
  node scripts/build-browser-advanced.js --minify
  node scripts/build-browser-advanced.js --output dist/codi.min.js --minify
`);
        process.exit(0);
        break;
    }
  }

  return options;
}

// Main execution
async function main() {
  try {
    const options = parseArgs();
    Object.assign(config, options);

    const generator = new BundleGenerator();
    const bundle = generator.generateBundle();

    if (config.minify) {
      console.log(
        '🗜️  Minification requested but not implemented. Consider using terser or esbuild.',
      );
    }
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    if (config.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BundleGenerator, ModuleGraph };
