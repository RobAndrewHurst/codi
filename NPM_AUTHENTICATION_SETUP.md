# NPM Authentication Setup for GitHub Actions

## 🚨 Problem: npm authentication failures in CI

If you're seeing errors like:
```
npm error code ENEEDAUTH
npm error need auth This command requires you to be logged in to https://registry.npmjs.org/
npm error need auth You need to authorize this machine using `npm adduser`
```

This guide will help you set up proper npm authentication for automated publishing.

## 🔧 Step-by-Step Setup

### 1. Create NPM Access Token

1. **Log in to npmjs.com**
   - Go to [npmjs.com](https://npmjs.com)
   - Sign in to your account

2. **Navigate to Access Tokens**
   - Click your profile picture → "Access Tokens"
   - Or go to: https://www.npmjs.com/settings/tokens

3. **Generate New Token**
   - Click "Generate New Token"
   - Choose **"Automation"** (for CI/CD)
   - Give it a descriptive name like "GitHub Actions - codi-test-framework"
   - Copy the token (starts with `npm_`)

⚠️ **Important**: Save the token immediately - you won't be able to see it again!

### 2. Add Token to GitHub Repository Secrets

1. **Go to Repository Settings**
   - Navigate to your GitHub repository
   - Click "Settings" tab
   - In the left sidebar, click "Secrets and variables" → "Actions"

2. **Add New Secret**
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token (the one starting with `npm_`)
   - Click "Add secret"

### 3. Verify Token Format

Your NPM token should look like:
```
npm_1234567890abcdef1234567890abcdef12345678
```

❌ **Common mistakes:**
- Using classic tokens (they look different)
- Including extra spaces or characters
- Using read-only tokens instead of automation tokens

### 4. Test Authentication

After setting up the secret, push a change to trigger the workflow and check if authentication works.

## 🔍 Troubleshooting

### Error: "ENEEDAUTH"

**Cause**: npm token is missing or invalid

**Solutions**:
1. Verify `NPM_TOKEN` secret exists in repository settings
2. Check token hasn't expired
3. Ensure token has "Automation" scope
4. Regenerate token if necessary

### Error: "E403 Forbidden"

**Cause**: Token doesn't have permission to publish

**Solutions**:
1. Verify you're a collaborator/owner of the npm package
2. Check token has publish permissions
3. Ensure package name isn't taken by someone else

### Error: "E404 Package not found"

**Cause**: First-time publishing or scope issues

**Solutions**:
1. For first publish, make sure package name is available
2. Check package.json name field is correct
3. For scoped packages, ensure org membership

### Workflow Still Failing?

Check these common issues:

1. **Secret Name**: Must be exactly `NPM_TOKEN` (case-sensitive)

2. **Token Type**: Must be "Automation" token, not "Publish" or "Read-only"

3. **Package Access**: Ensure you have publish rights to the package

4. **Organization Packages**: If publishing to an org scope (like `@myorg/package`), you may need additional permissions

## 🎯 Verification Commands

### Local Testing (Optional)

If you want to test the token locally:

```bash
# Set the token (replace with your actual token)
export NPM_TOKEN="npm_your_token_here"

# Configure npm
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

# Test authentication
npm whoami

# Should show your npm username
```

### GitHub Actions Testing

The workflow includes verification steps:

```yaml
- name: Verify authentication works
  run: npm whoami
```

This will fail early if authentication is broken.

## 📋 Quick Checklist

- [ ] NPM account exists and is verified
- [ ] Automation token created on npmjs.com
- [ ] Token copied and saved securely
- [ ] `NPM_TOKEN` secret added to GitHub repository
- [ ] Secret value is the full token (starts with `npm_`)
- [ ] You have publish permissions for the package
- [ ] Package name in package.json is correct

## 🚀 Example Workflow Fragment

Here's how the authentication should look in your workflow:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    registry-url: 'https://registry.npmjs.org'
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

- name: Publish to NPM
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  run: |
    # Verify token is available
    if [ -z "$NODE_AUTH_TOKEN" ]; then
      echo "❌ ERROR: NPM_TOKEN secret is not set"
      exit 1
    fi
    
    # Configure authentication
    echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" > ~/.npmrc
    
    # Verify authentication
    npm whoami
    
    # Publish package
    npm publish --access public
```

## 🔗 Useful Links

- [NPM Tokens Documentation](https://docs.npmjs.com/about-access-tokens)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Troubleshooting npm publish](https://docs.npmjs.com/troubleshooting-npm-publish-errors)

## 🆘 Still Having Issues?

1. **Check workflow logs** for specific error messages
2. **Regenerate the NPM token** and update the GitHub secret
3. **Contact npm support** if you suspect account issues
4. **Review package.json** for correct name and version

Remember: The automation token is different from your login password - it's specifically designed for CI/CD systems like GitHub Actions.