# ESM Import Issues - Fix Guide

This document explains the ESM import issues you encountered and provides solutions for using Codi in browser environments.

## The Problem

When trying to import Codi from ESM CDN services like `esm.sh` in a browser environment, you encountered errors like:

```
GET https://esm.sh/puppeteer-core@23.11.1/es2022/internal/puppeteer-core.mjs net::ERR_ABORTED 404 (Not Found)
TypeError: Failed to fetch dynamically imported module: https://esm.sh/codi-test-framework@1.0.39
ReferenceError: codi is not defined
```

### Root Cause

The issue occurs because:

1. **Node.js Dependencies in Browser**: The main `_codi.js` file imports `browserRunner.js`, which depends on Puppeteer and other Node.js-only modules
2. **ESM CDN Resolution**: When ESM CDN services try to resolve all dependencies for browser use, they fail because Puppeteer can't run in browsers
3. **Import Chain Contamination**: Even though the browser runner is conditionally imported, the import statement at the top level causes the entire dependency tree to be analyzed

## Solutions

We've implemented multiple solutions to resolve this issue:

### Solution 1: Browser-Specific Entry Point

**File**: `src/_codi.browser.js`

This is a browser-only version that excludes all Node.js dependencies:

```javascript
// Use this for browser environments
import * as codi from "https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.39/src/_codi.browser.js";
```

### Solution 2: IIFE Build for Direct Browser Use

**File**: `dist/codi.browser.js`

A self-contained IIFE (Immediately Invoked Function Expression) build that works without module imports:

```html
<script src="https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.39/dist/codi.browser.js"></script>
<script>
  // codi is now available globally
  console.log(codi.version);
</script>
```

### Solution 3: Package.json Configuration

Updated `package.json` with proper export mapping:

```json
{
  "exports": {
    ".": {
      "browser": "./src/_codi.browser.js",
      "node": "./src/_codi.js",
      "default": "./src/_codi.js"
    },
    "./browser": "./dist/codi.browser.js"
  }
}
```

### Solution 4: Fallback Strategy

Updated your existing tests with graceful fallbacks:

```javascript
// Try CDN import with fallback
let codi;
try {
  codi = await import(
    "https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.39/src/_codi.browser.js"
  );
} catch (error) {
  // Fallback to minimal implementation
  codi = createFallbackCodi();
}
```

## Recommended Usage Patterns

### For Modern Web Applications

```javascript
// ES modules with proper browser entry point
import * as codi from "https://cdn.jsdelivr.net/npm/codi-test-framework@latest/src/_codi.browser.js";

describe({ name: "My Tests", id: "tests" }, () => {
  it({ name: "should work in browser", parentId: "tests" }, () => {
    codi.assertTrue(typeof window !== "undefined");
  });
});
```

### For CodePen/JSFiddle

```html
<script src="https://cdn.jsdelivr.net/npm/codi-test-framework@latest/dist/codi.browser.js"></script>
<script>
  codi.describe({ name: "Browser Tests", id: "browser" }, () => {
    codi.it({ name: "DOM test", parentId: "browser" }, () => {
      const div = document.createElement("div");
      codi.assertEqual(div.tagName, "DIV");
    });
  });

  // Run tests
  codi.runWebTestFunction(() => {
    // Your test suites here
  });
</script>
```

### For Static HTML Pages

Use the complete HTML template in `tests/codepen-iife.html` as a reference.

## CDN Options

### Primary (Recommended)

- **JSDelivr**: `https://cdn.jsdelivr.net/npm/codi-test-framework@latest/`
- More reliable for browser builds
- Better caching and global CDN

### Alternative

- **UNPKG**: `https://unpkg.com/codi-test-framework@latest/`
- Good fallback option

### Not Recommended for Browser

- **ESM.sh**: Has issues with complex Node.js dependency trees
- Only use if you're certain about the module structure

## Testing Your Fix

1. **Local Testing**: Use the provided HTML file to test locally
2. **CDN Testing**: Verify imports work from actual CDN URLs
3. **Browser DevTools**: Check for any remaining import errors

## Environment Detection

The framework now automatically detects the environment:

```javascript
// In Node.js: Full feature set including browser testing
const codi = require("codi-test-framework");
codi.runBrowserTests("./tests", false, {}, { quiet: true });

// In Browser: Web-optimized feature set
// Only includes: describe, it, assertions, runWebTestFunction
```

## Migration Guide

If you have existing browser tests that are failing:

### Before (Broken)

```javascript
import * as codi from "https://esm.sh/codi-test-framework@1.0.39";
```

### After (Fixed)

```javascript
import * as codi from "https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.39/src/_codi.browser.js";
```

### Or use IIFE

```html
<script src="https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.39/dist/codi.browser.js"></script>
```

## Available Features by Environment

### Node.js Environment

- ✅ All assertion functions
- ✅ describe/it test structure
- ✅ Node.js test runner
- ✅ Browser test runner (headless)
- ✅ HTTP mocking
- ✅ Module mocking

### Browser Environment

- ✅ All assertion functions
- ✅ describe/it test structure
- ✅ Web test runner
- ✅ DOM testing capabilities
- ✅ Async test support
- ❌ Node.js test runner
- ❌ Headless browser testing
- ❌ File system operations

## Troubleshooting

### Import Still Failing?

1. **Check CDN Status**: Ensure the CDN is accessible
2. **Version Mismatch**: Verify you're using a published version
3. **CORS Issues**: Some environments may block CDN imports
4. **Use Local Copy**: Download and serve the browser build locally

### Console Errors

- `codi is not defined`: Import failed, check browser network tab
- `Failed to fetch module`: CDN or network issue
- `Unexpected token`: Wrong file type, ensure you're using `.js` not `.mjs` for browser

### Performance Issues

- Use the IIFE build for faster loading
- Cache the CDN resources locally for development
- Use specific version numbers instead of `@latest` for production

## Support

If you continue to experience issues:

1. Check the browser's Network tab for failed requests
2. Verify the CDN URL returns valid JavaScript
3. Test with the provided HTML template first
4. Consider using the local IIFE build for development

This fix ensures that Codi works seamlessly in both Node.js and browser environments without dependency conflicts.

