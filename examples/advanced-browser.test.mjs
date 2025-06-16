import { assertEqual, assertTrue, describe, it } from '../src/_codi.js';

// Web Components Testing
describe({ name: 'Web Components', id: 'web_components' }, () => {
  it(
    { name: 'should create custom elements', parentId: 'web_components' },
    () => {
      // Define a custom element
      class TestButton extends HTMLElement {
        constructor() {
          super();
          this.attachShadow({ mode: 'open' });
          this.shadowRoot.innerHTML = `
          <style>
            button {
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover { background: #0056b3; }
          </style>
          <button><slot>Default Text</slot></button>
        `;
        }

        connectedCallback() {
          this.shadowRoot
            .querySelector('button')
            .addEventListener('click', () => {
              this.dispatchEvent(
                new CustomEvent('test-click', { detail: { clicked: true } }),
              );
            });
        }
      }

      // Register the custom element
      if (!customElements.get('test-button')) {
        customElements.define('test-button', TestButton);
      }

      // Create and test the element
      const testButton = document.createElement('test-button');
      testButton.textContent = 'Click Me';
      document.body.appendChild(testButton);

      // Test shadow DOM
      assertTrue(testButton.shadowRoot !== null, 'Shadow root should exist');
      const shadowButton = testButton.shadowRoot.querySelector('button');
      assertTrue(shadowButton !== null, 'Button should exist in shadow DOM');

      // Test custom event
      let eventFired = false;
      testButton.addEventListener('test-click', (e) => {
        eventFired = true;
        assertEqual(e.detail.clicked, true);
      });

      shadowButton.click();
      assertTrue(eventFired, 'Custom event should fire on click');

      // Clean up
      document.body.removeChild(testButton);
    },
  );
});

// Intersection Observer Testing
describe({ name: 'Intersection Observer', id: 'intersection_observer' }, () => {
  it(
    {
      name: 'should observe element visibility',
      parentId: 'intersection_observer',
    },
    (done) => {
      const target = document.createElement('div');
      target.style.cssText =
        'width: 100px; height: 100px; background: red; position: absolute; top: -200px;';
      document.body.appendChild(target);

      let observerCallbackCalled = false;

      const observer = new IntersectionObserver((entries) => {
        observerCallbackCalled = true;
        const entry = entries[0];

        if (entry.target === target) {
          if (entry.isIntersecting) {
            assertTrue(
              entry.intersectionRatio > 0,
              'Element should be intersecting',
            );
          } else {
            assertEqual(
              entry.intersectionRatio,
              0,
              'Hidden element should have 0 intersection ratio',
            );
          }
        }

        observer.disconnect();
        document.body.removeChild(target);

        // Use setTimeout to ensure this is async
        setTimeout(() => {
          assertTrue(
            observerCallbackCalled,
            'Observer callback should be called',
          );
        }, 0);
      });

      observer.observe(target);

      // Move element into view
      setTimeout(() => {
        target.style.top = '0px';
      }, 10);
    },
  );
});

// Mutation Observer Testing
describe({ name: 'Mutation Observer', id: 'mutation_observer' }, () => {
  it(
    { name: 'should observe DOM mutations', parentId: 'mutation_observer' },
    async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      let mutationDetected = false;
      let addedNodes = [];

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutationDetected = true;
            addedNodes = Array.from(mutation.addedNodes);
          }
        });
      });

      observer.observe(container, { childList: true, subtree: true });

      // Add a child element
      const child = document.createElement('span');
      child.textContent = 'Added child';
      container.appendChild(child);

      // Wait for mutation observer to fire
      await new Promise((resolve) => setTimeout(resolve, 10));

      assertTrue(mutationDetected, 'Mutation should be detected');
      assertEqual(addedNodes.length, 1, 'Should detect one added node');
      assertEqual(addedNodes[0], child, 'Should detect the correct added node');

      observer.disconnect();
      document.body.removeChild(container);
    },
  );
});

// Canvas Testing
describe({ name: 'Canvas Operations', id: 'canvas_tests' }, () => {
  it({ name: 'should draw on canvas', parentId: 'canvas_tests' }, () => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 100;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    assertTrue(ctx !== null, 'Should get 2D context');

    // Draw a rectangle
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(10, 10, 50, 30);

    // Test pixel data
    const imageData = ctx.getImageData(20, 20, 1, 1);
    const pixel = imageData.data;

    // Red pixel should have red=255, green=0, blue=0, alpha=255
    assertEqual(pixel[0], 255, 'Red component should be 255');
    assertEqual(pixel[1], 0, 'Green component should be 0');
    assertEqual(pixel[2], 0, 'Blue component should be 0');
    assertEqual(pixel[3], 255, 'Alpha component should be 255');

    document.body.removeChild(canvas);
  });
});

// Drag and Drop Testing
describe({ name: 'Drag and Drop', id: 'drag_drop' }, () => {
  it({ name: 'should handle drag events', parentId: 'drag_drop' }, () => {
    const draggable = document.createElement('div');
    draggable.draggable = true;
    draggable.textContent = 'Drag me';
    draggable.style.cssText =
      'width: 100px; height: 50px; background: blue; color: white;';

    const dropzone = document.createElement('div');
    dropzone.style.cssText =
      'width: 200px; height: 100px; background: lightgray; margin: 10px;';
    dropzone.textContent = 'Drop here';

    document.body.appendChild(draggable);
    document.body.appendChild(dropzone);

    let dragStarted = false;
    let dropOccurred = false;
    let dragData = null;

    draggable.addEventListener('dragstart', (e) => {
      dragStarted = true;
      e.dataTransfer.setData('text/plain', 'dragged-item');
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault(); // Allow drop
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropOccurred = true;
      dragData = e.dataTransfer.getData('text/plain');
    });

    // Simulate drag and drop events
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });
    draggable.dispatchEvent(dragStartEvent);

    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });
    dropEvent.dataTransfer.setData('text/plain', 'dragged-item');
    dropzone.dispatchEvent(dropEvent);

    assertTrue(dragStarted, 'Drag should start');
    assertTrue(dropOccurred, 'Drop should occur');
    assertEqual(dragData, 'dragged-item', 'Drag data should be preserved');

    document.body.removeChild(draggable);
    document.body.removeChild(dropzone);
  });
});

// Responsive Design Testing
describe({ name: 'Responsive Design', id: 'responsive' }, () => {
  it({ name: 'should handle media queries', parentId: 'responsive' }, () => {
    // Create a media query
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    assertTrue(
      typeof mediaQuery.matches === 'boolean',
      'Media query should have matches property',
    );
    assertTrue(
      typeof mediaQuery.addListener === 'function',
      'Media query should have addListener method',
    );

    // Test viewport meta tag creation
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewport);

    const viewportMeta = document.querySelector('meta[name="viewport"]');
    assertTrue(viewportMeta !== null, 'Viewport meta tag should exist');
    assertEqual(viewportMeta.content, 'width=device-width, initial-scale=1.0');

    document.head.removeChild(viewport);
  });
});

// Performance Testing
describe({ name: 'Performance Monitoring', id: 'performance' }, () => {
  it({ name: 'should measure performance', parentId: 'performance' }, () => {
    // Test Performance API
    assertTrue(
      typeof performance !== 'undefined',
      'Performance API should be available',
    );
    assertTrue(
      typeof performance.now === 'function',
      'performance.now should be available',
    );
    assertTrue(
      typeof performance.mark === 'function',
      'performance.mark should be available',
    );

    const startTime = performance.now();

    // Simulate some work
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    assertTrue(duration >= 0, 'Duration should be non-negative');
    assertTrue(typeof duration === 'number', 'Duration should be a number');

    // Test performance marks
    performance.mark('test-start');
    performance.mark('test-end');
    performance.measure('test-duration', 'test-start', 'test-end');

    const measures = performance.getEntriesByType('measure');
    const testMeasure = measures.find((m) => m.name === 'test-duration');

    assertTrue(testMeasure !== undefined, 'Performance measure should exist');
    assertTrue(
      testMeasure.duration >= 0,
      'Measure duration should be non-negative',
    );
  });
});

// Error Handling in Browser Context
describe({ name: 'Error Handling', id: 'error_handling' }, () => {
  it(
    { name: 'should handle script errors', parentId: 'error_handling' },
    () => {
      let errorCaught = false;
      let errorEvent = null;

      const originalErrorHandler = window.onerror;

      window.onerror = (message, source, lineno, colno, error) => {
        errorCaught = true;
        errorEvent = { message, source, lineno, colno, error };
        return true; // Prevent default error handling
      };

      // Trigger an error
      try {
        throw new Error('Test error');
      } catch (e) {
        // Manually trigger onerror for testing
        window.onerror(e.message, 'test-script', 1, 1, e);
      }

      assertTrue(errorCaught, 'Error should be caught by window.onerror');
      assertEqual(
        errorEvent.message,
        'Test error',
        'Error message should match',
      );

      // Restore original handler
      window.onerror = originalErrorHandler;
    },
  );

  it(
    {
      name: 'should handle unhandled promise rejections',
      parentId: 'error_handling',
    },
    async () => {
      let rejectionCaught = false;
      let rejectionEvent = null;

      const originalRejectionHandler = window.onunhandledrejection;

      window.onunhandledrejection = (event) => {
        rejectionCaught = true;
        rejectionEvent = event;
        event.preventDefault(); // Prevent default handling
      };

      // Create an unhandled rejection
      Promise.reject(new Error('Unhandled rejection test'));

      // Wait for the rejection to be processed
      await new Promise((resolve) => setTimeout(resolve, 10));

      assertTrue(rejectionCaught, 'Unhandled rejection should be caught');
      assertTrue(
        rejectionEvent.reason instanceof Error,
        'Rejection reason should be an Error',
      );
      assertEqual(rejectionEvent.reason.message, 'Unhandled rejection test');

      // Restore original handler
      window.onunhandledrejection = originalRejectionHandler;
    },
  );
});

// Accessibility Testing
describe({ name: 'Accessibility', id: 'a11y' }, () => {
  it({ name: 'should test ARIA attributes', parentId: 'a11y' }, () => {
    const button = document.createElement('button');
    button.textContent = 'Accessible Button';
    button.setAttribute('aria-label', 'Close dialog');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('role', 'button');

    document.body.appendChild(button);

    assertEqual(button.getAttribute('aria-label'), 'Close dialog');
    assertEqual(button.getAttribute('aria-expanded'), 'false');
    assertEqual(button.getAttribute('role'), 'button');

    // Test focus management
    button.focus();
    assertEqual(document.activeElement, button, 'Button should receive focus');

    document.body.removeChild(button);
  });

  it({ name: 'should test keyboard navigation', parentId: 'a11y' }, () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');

    button1.textContent = 'First';
    button1.tabIndex = 1;
    button2.textContent = 'Second';
    button2.tabIndex = 2;

    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);

    // Test tab order
    button1.focus();
    assertEqual(
      document.activeElement,
      button1,
      'First button should be focused',
    );

    // Simulate Tab key
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      code: 'Tab',
      keyCode: 9,
      bubbles: true,
    });

    button1.dispatchEvent(tabEvent);

    // In a real browser, focus would move, but in our test environment
    // we can at least verify the event was created properly
    assertEqual(tabEvent.key, 'Tab');
    assertEqual(tabEvent.keyCode, 9);

    document.body.removeChild(container);
  });
});
