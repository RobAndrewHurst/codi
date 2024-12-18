// console-implementation.js
export function codepenLogging() {
    var following = false,
        pre = document.createElement('pre'),
        code = document.createElement('code');

    pre.appendChild(code);
    document.body.appendChild(pre);

    // Capture the original console methods
    var originalConsole = {
        log: window.console.log,
        info: window.console.info,
        warn: window.console.warn,
        error: window.console.error
    };

    function clear() {
        while (code.hasChildNodes()) {
            code.removeChild(code.lastChild);
        }
    }

    function follow() {
        following = true;
    }

    function print(className, ...objects) {
        let s = objects.map(obj => {
            if (typeof obj === 'string') {
                return obj;
            } else {
                try {
                    return JSON.stringify(obj);
                } catch (e) {
                    return String(obj);
                }
            }
        }).join(' ');

        // Remove only the ANSI escape sequences while keeping the text
        s = s.replace(/\[\d{1,2}m/g, '');

        var span = document.createElement('span'),
            text = document.createTextNode(s + '\n');

        span.setAttribute('class', className);
        span.appendChild(text);
        code.appendChild(span);

        if (following) {
            scrollToBottom();
        }
    }

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    // Override the global console
    window.console = {
        clear: clear,
        follow: follow,
        log: function (...args) {
            print('debug', ...args);
            originalConsole.log(...args);
        },
        info: function (...args) {
            print('info', ...args);
            originalConsole.info(...args);
        },
        warn: function (...args) {
            print('warn', ...args);
            originalConsole.warn(...args);
        },
        error: function (...args) {
            print('error', ...args);
            originalConsole.error(...args);
        }
    };

    return window.console;
}