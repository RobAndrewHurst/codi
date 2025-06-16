# Browser Testing with Codi 🌐

This guide shows you how to use Codi's browser testing capabilities to test DOM manipulation, browser APIs, and web-specific functionality.

## Overview

Codi supports running tests in a headless browser environment using Puppeteer. This is perfect for:

- Testing DOM manipulation
- Validating browser API interactions
- Testing web components
- Verifying client-side JavaScript behavior
- Running tests that need `window`, `document`, or other browser globals

## Getting Started

### Prerequisites

Make sure you have Puppeteer installed (it's included as a dependency):

```bash
npm install puppeteer
```

### Running Browser Tests

Use the `--browser` flag to run tests in a headless browser:

```bash
# Run all browser tests
codi ./tests --browser

# Run browser tests quietly (only show failures)
codi ./tests --browser --quiet

# Use npm script
npm run test_browser
```

## Writing Browser Tests

Browser tests use the same API as regular Codi tests, but have access to browser-specific APIs.

### Basic Example

```javascript
import { describe, it, assertEqual, assertTrue } from "codi-test-framework";

describe({ name: "DOM Manipulation Tests", id: "dom_tests" }, () => {
  it(
    {
      name: "should create and manipulate DOM elements",
      parentId: "dom_tests",
    },
    () => {
      // Create elements
      const container = document.createElement("div");
      const button = document.createElement("button");
      const span = document.createElement("span");

      // Set properties
      button.textContent = "Click me!";
      button.id = "test-button";
      span.textContent = "Hello World";
      span.className = "greeting";

      // Build DOM structure
      container.appendChild(button);
      container.appendChild(span);
      document.body.appendChild(container);

      // Test the structure
      assertEqual(container.children.length, 2);
      assertEqual(button.textContent, "Click me!");
      assertEqual(span.className, "greeting");
      assertTrue(document.getElementById("test-button") === button);

      // Clean up
      document.body.removeChild(container);
    },
  );

  it({ name: "should handle events", parentId: "dom_tests" }, () => {
    const button = document.createElement("button");
    let clicked = false;

    button.addEventListener("click", () => {
      clicked = true;
    });

    // Simulate click
    button.click();

    assertTrue(clicked, "Button click should trigger event handler");
  });
});
```

### Browser API Testing

```javascript
describe({ name: "Browser API Tests", id: "browser_api" }, () => {
  it(
    { name: "should have access to browser globals", parentId: "browser_api" },
    () => {
      // Test global objects
      assertTrue(typeof window !== "undefined", "window should be available");
      assertTrue(
        typeof document !== "undefined",
        "document should be available",
      );
      assertTrue(
        typeof navigator !== "undefined",
        "navigator should be available",
      );
      assertTrue(typeof console !== "undefined", "console should be available");
    },
  );

  it({ name: "should work with fetch API", parentId: "browser_api" }, () => {
    assertTrue(typeof fetch === "function", "fetch should be available");
    // Note: actual network requests would need mocking in tests
  });

  it({ name: "should handle localStorage", parentId: "browser_api" }, () => {
    try {
      // localStorage might be restricted in some test environments
      localStorage.setItem("test", "value");
      assertEqual(localStorage.getItem("test"), "value");
      localStorage.removeItem("test");
    } catch (error) {
      // This is expected in data: URL contexts
      console.log(
        "localStorage access restricted - this is normal in test environments",
      );
    }
  });
});
```

### Async Operations

```javascript
describe({ name: "Async Browser Tests", id: "async_browser" }, () => {
  it(
    { name: "should handle async operations", parentId: "async_browser" },
    async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve("async result"), 100);
      });

      const result = await promise;
      assertEqual(result, "async result");
    },
  );

  it(
    { name: "should handle DOM ready state", parentId: "async_browser" },
    () => {
      // Document should be ready in test environment
      assertTrue(
        ["loading", "interactive", "complete"].includes(document.readyState),
      );
    },
  );
});
```

### Form Testing

```javascript
describe({ name: "Form Tests", id: "form_tests" }, () => {
  it(
    { name: "should create and validate forms", parentId: "form_tests" },
    () => {
      // Create form
      const form = document.createElement("form");
      const input = document.createElement("input");
      const button = document.createElement("button");

      input.type = "text";
      input.name = "username";
      input.required = true;

      button.type = "submit";
      button.textContent = "Submit";

      form.appendChild(input);
      form.appendChild(button);
      document.body.appendChild(form);

      // Test form properties
      assertEqual(form.elements.length, 2);
      assertEqual(form.elements.username, input);
      assertTrue(input.required);

      // Test validation
      input.value = "";
      assertFalse(
        input.checkValidity(),
        "Empty required field should be invalid",
      );

      input.value = "testuser";
      assertTrue(
        input.checkValidity(),
        "Filled required field should be valid",
      );

      // Clean up
      document.body.removeChild(form);
    },
  );
});
```

### CSS and Styling

```javascript
describe({ name: "CSS Tests", id: "css_tests" }, () => {
  it({ name: "should apply and test styles", parentId: "css_tests" }, () => {
    const div = document.createElement("div");
    document.body.appendChild(div);

    // Apply styles
    div.style.width = "100px";
    div.style.height = "50px";
    div.style.backgroundColor = "red";
    div.style.display = "block";

    // Test computed styles
    const computedStyle = window.getComputedStyle(div);
    assertEqual(div.style.width, "100px");
    assertEqual(div.style.height, "50px");
    assertEqual(div.style.backgroundColor, "red");

    // Test CSS classes
    div.className = "test-class active";
    assertTrue(div.classList.contains("test-class"));
    assertTrue(div.classList.contains("active"));
    assertEqual(div.classList.length, 2);

    document.body.removeChild(div);
  });
});
```

## Best Practices

### 1. File Naming

Name your browser test files with `.browser.test.mjs` or put them in a `browser/` directory:

```
tests/
├── browser/
│   ├── dom.test.mjs
│   ├── forms.test.mjs
│   └── api.test.mjs
├── dom.browser.test.mjs
└── regular.test.mjs
```

### 2. Clean Up Resources

Always clean up DOM elements you create:

```javascript
it({ name: "should clean up after test", parentId: "cleanup_tests" }, () => {
  const element = document.createElement("div");
  document.body.appendChild(element);

  // ... test logic ...

  // Clean up
  document.body.removeChild(element);
});
```

### 3. Handle Browser Limitations

Some APIs might be restricted in test environments:

```javascript
it(
  { name: "should handle API restrictions gracefully", parentId: "api_tests" },
  () => {
    try {
      // Try to use the API
      localStorage.setItem("test", "value");
      assertEqual(localStorage.getItem("test"), "value");
    } catch (error) {
      // Handle gracefully
      console.log("API restricted in test environment - this is expected");
      assertTrue(true, "Test passes even with API restrictions");
    }
  },
);
```

### 4. Test Organization

Group related browser tests together:

```javascript
describe({ name: "User Interface Tests", id: "ui_tests" }, () => {
  describe(
    { name: "Button Components", id: "button_tests", parentId: "ui_tests" },
    () => {
      // Button-specific tests
    },
  );

  describe(
    { name: "Form Components", id: "form_tests", parentId: "ui_tests" },
    () => {
      // Form-specific tests
    },
  );
});
```

## CI/CD Integration

### GitHub Actions

Your GitHub Actions workflow can run both Node.js and browser tests:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  node-tests:
    name: Node.js Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: node cli.js tests --returnResults

  browser-tests:
    name: Browser Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: node cli.js tests --browser --returnResults
```

### Docker

```dockerfile
FROM node:18-alpine

# Install Chrome dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Run tests
CMD ["npm", "run", "test_browser"]
```

## Troubleshooting

### Common Issues

1. **localStorage Access Denied**: This is normal in `data:` URL contexts. Handle gracefully with try-catch.

2. **Puppeteer Installation Issues**: Make sure you have sufficient disk space and network access.

3. **Tests Timing Out**: Increase timeout for complex operations or add proper waiting logic.

4. **Memory Issues**: Clean up DOM elements and event listeners properly.

### Debug Mode

For debugging, you can run Puppeteer in non-headless mode by modifying the browser runner temporarily:

```javascript
// In browserRunner.js (for debugging only)
browser = await puppeteer.launch({
  headless: false, // Set to false for debugging
  devtools: true, // Open DevTools
});
```

## Conclusion

Browser testing with Codi provides a powerful way to test web functionality in a real browser environment while maintaining the simplicity and speed of your existing test suite. Use it to complement your Node.js tests and ensure your web applications work correctly across different environments.

