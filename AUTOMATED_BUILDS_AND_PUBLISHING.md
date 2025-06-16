# Automated Builds and Publishing Guide

This guide explains how to use the automated build system and experimental npm publishing workflow for the Codi test framework.

## 🚀 Overview

The Codi project now includes a comprehensive CI/CD pipeline that automatically:

- **Builds** browser bundles on every push/PR
- **Tests** both Node.js and browser environments
- **Publishes** experimental versions to npm
- **Creates** GitHub releases for stable versions
- **Validates** built artifacts with automated tests

## 🔄 Automated Workflows

### 1. Standard Testing (`unit_tests.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main`

**Actions:**
- Runs Node.js tests
- Runs browser tests with Puppeteer
- No publishing

### 2. Build and Publish (`build-and-publish.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Git tags starting with `v*`
- Manual workflow dispatch
- Pull requests to `main` or `develop`

**Actions:**
- Builds browser bundle
- Runs comprehensive tests
- Conditionally publishes to npm
- Creates GitHub releases for stable versions

## 📦 Publishing Strategy

### Automatic Publishing

| Trigger | Version Type | NPM Tag | Example |
|---------|-------------|---------|---------|
| Push to `main` | Beta (auto-increment) | `beta` | `1.0.40-beta.123` |
| Git tag `v*` | Stable | `latest` | `1.0.40` |
| Manual dispatch | Configurable | Varies | `1.0.40-alpha.1` |

### Manual Publishing

You can trigger experimental releases manually through GitHub Actions:

1. Go to **Actions** → **Build, Test, and Publish**
2. Click **Run workflow**
3. Choose options:
   - **Publish type**: `beta`, `alpha`, `rc`, or `latest`
   - **Force version**: Optional specific version

## 🛠️ Development Workflow

### For Regular Development

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Push to main (triggers auto-beta publish)
git push origin main

# 3. Check GitHub Actions for build status
# 4. Test the beta version: npm install codi-test-framework@beta
```

### For Testing New Features

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test locally
npm run build
npm test
npm run test_browser

# 3. Push and create PR (triggers build + test, no publish)
git push origin feature/my-feature
# Create PR via GitHub

# 4. After PR approval, merge triggers beta publish
```

### For Stable Releases

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Create and push git tag
git tag v1.0.40
git push origin v1.0.40

# 3. This triggers stable release to npm@latest
```

## 🧪 Testing Experimental Versions

### Install Experimental Versions

```bash
# Latest beta
npm install codi-test-framework@beta

# Latest alpha  
npm install codi-test-framework@alpha

# Latest release candidate
npm install codi-test-framework@rc

# Specific experimental version
npm install codi-test-framework@1.0.40-beta.5
```

### Browser Testing with Experimental Versions

```html
<!-- ESM import with specific beta version (Recommended) -->
<script type="module">
import * as codi from 'https://esm.sh/codi-test-framework@1.0.40-beta.5';
</script>

<!-- ESM import with latest beta -->
<script type="module">
import * as codi from 'https://esm.sh/codi-test-framework@beta';
</script>

<!-- Alternative: CDN with specific beta version -->
<script src="https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.40-beta.5/dist/codi.browser.js"></script>
```
</end_text>

<old_text>
## 🌐 CDN Usage

### Recommended Usage

**ESM Import (Preferred):**
```javascript
import * as codi from 'https://cdn.jsdelivr.net/npm/codi-test-framework@latest/src/_codi.browser.js';
```

**IIFE Bundle:**
```html
<script src="https://cdn.jsdelivr.net/npm/codi-test-framework@latest/dist/codi.browser.js"></script>
```

**Experimental Versions:**
```javascript
// Latest beta
import * as codi from 'https://cdn.jsdelivr.net/npm/codi-test-framework@beta/src/_codi.browser.js';

// Specific version
import * as codi from 'https://cdn.jsdelivr.net/npm/codi-test-framework@1.0.40-beta.5/src/_codi.browser.js';
```

## 🌐 CDN Usage

### Recommended Usage

**🎯 ESM Import (Preferred - ESM.sh):**
```javascript
import * as codi from 'https://esm.sh/codi-test-framework@latest';
```

**ESM Import (Alternative - JSDelivr):**
```javascript
import * as codi from 'https://cdn.jsdelivr.net/npm/codi-test-framework@latest/src/_codi.browser.js';
```

**IIFE Bundle:**
```html
<script src="https://cdn.jsdelivr.net/npm/codi-test-framework@latest/dist/codi.browser.js"></script>
```

**Experimental Versions:**
```javascript
// Latest beta via ESM.sh (preferred)
import * as codi from 'https://esm.sh/codi-test-framework@beta';

// Specific version via ESM.sh
import * as codi from 'https://esm.sh/codi-test-framework@1.0.40-beta.5';

// Alternative: JSDelivr with browser-specific entry
import * as codi from 'https://cdn.jsdelivr.net/npm/codi-test-framework@beta/src/_codi.browser.js';
```

## 🔍 Build Verification

The automated build system includes comprehensive verification:

### 1. Bundle Creation
- ✅ Generates `dist/codi.browser.js`
- ✅ Creates source maps
- ✅ Validates bundle size
- ✅ Checks for import/export issues

### 2. Multi-Environment Testing
- ✅ Node.js environment tests
- ✅ Browser environment tests (Puppeteer)
- ✅ Built bundle validation
- ✅ CDN compatibility verification (ESM.sh, JSDelivr, UNPKG)
- ✅ Main entry point browser compatibility

### 3. Artifact Validation
- ✅ Global `codi` object availability
- ✅ All functions properly exported
- ✅ Basic functionality tests
- ✅ Browser compatibility checks
- ✅ ESM.sh compatibility validation

## 📊 Monitoring and Debugging

### GitHub Actions Logs

1. **Build Logs**: Check Actions tab for detailed build output
2. **Test Results**: View test summaries in workflow runs
3. **Publish Status**: Confirm npm publish success/failure
4. **Artifact Downloads**: Download built bundles for inspection

### Local Debugging

```bash
# Test the build process locally
npm run build

# Verify the built bundle
ls -la dist/
file dist/codi.browser.js

# Test the bundle in browser
open test-browser-import.html

# Run all tests locally
npm test
npm run test_browser
```

### NPM Package Verification

```bash
# Check published versions
npm view codi-test-framework versions --json

# Check specific version info
npm view codi-test-framework@beta

# Download and inspect
npm pack codi-test-framework@beta
tar -tf codi-test-framework-*.tgz
```

## 🚨 Troubleshooting

### Common Issues

**Build Fails**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build script output for specific errors

**Tests Fail**
- Ensure Chrome/Chromium is available for Puppeteer
- Check for network issues with CDN imports
- Verify test file syntax and imports

**Publish Fails**
- Confirm `NPM_TOKEN` secret is set correctly
- Check version conflicts (version already published)
- Verify npm registry accessibility

**CDN Issues**
- Allow time for CDN propagation (up to 30 minutes)
- Try alternative CDNs (ESM.sh vs JSDelivr vs UNPKG)
- Check version-specific URLs
- For ESM.sh issues, try the browser-specific entry point as fallback
- For ESM.sh issues, try the browser-specific entry point as fallback

### Manual Recovery

If automated publishing fails, you can publish manually:

```bash
# 1. Build locally
npm run build

# 2. Update version
npm version 1.0.40-beta.6 --no-git-tag-version

# 3. Publish with tag
npm publish --tag beta

# 4. Verify
npm view codi-test-framework@beta
```

## 🔧 Configuration

### Required Secrets

Set these in your GitHub repository settings:

- `NPM_TOKEN`: NPM automation token with publish permissions
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Workflow Customization

Edit `.github/workflows/build-and-publish.yml` to customize:

- Node.js version
- Test commands
- Build scripts
- Publishing conditions
- Notification settings

## 📈 Best Practices

### Version Management
- Use semantic versioning (semver)
- Test beta versions before promoting to stable
- Keep pre-release versions for limited time
- Document breaking changes clearly

### Testing Strategy
- Always test in multiple browsers
- Verify both npm and CDN distribution
- Test with different import methods (ESM via ESM.sh, ESM via JSDelivr, IIFE)
- Test main entry point compatibility with ESM.sh
- Include regression tests for critical functionality

### ESM.sh Compatibility
- Main entry point now works seamlessly with ESM.sh
- Browser-safe dynamic imports prevent blocking
- Node.js-specific features gracefully degrade in browser
- Maintains full compatibility with both environments

### Release Communication
- Monitor GitHub Actions notifications
- Update documentation with new features
- Communicate breaking changes to users
- Maintain changelog for version history

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [ESM.sh Documentation](https://esm.sh/)
- [JSDelivr Documentation](https://www.jsdelivr.com/documentation)
- [CDN Usage Guide](https://www.jsdelivr.com/documentation)

## 🤝 Contributing

When contributing to the build system:

1. Test changes in a fork first
2. Update this documentation for new features
3. Consider backward compatibility
4. Test with multiple Node.js versions
5. Verify browser compatibility across different environments

---

*This document is part of the Codi Test Framework project. For more information, see the main [README.md](README.md).*