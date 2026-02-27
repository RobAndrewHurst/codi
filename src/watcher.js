import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

/**
 * Watch a test directory for changes and re-run tests on each change.
 *
 * Spawns a child process for each test run so the module cache is fresh.
 * Uses Node.js native `fs.watch` with recursive option (Node 19+).
 *
 * @param {string} testDirectory - Directory to watch
 * @param {object} argv - Original process.argv (forwarded to child, minus --watch)
 */
export function watch(testDirectory, argv) {
  const watchDir = path.resolve(testDirectory);

  // Build the child command: same CLI invocation but without --watch
  const nodeArgs = argv.slice(1).filter((arg) => arg !== '--watch');

  let running = false;
  let queued = false;

  function clearScreen() {
    process.stdout.write('\x1Bc');
  }

  function runTests() {
    if (running) {
      queued = true;
      return;
    }

    running = true;
    clearScreen();

    const timestamp = new Date().toLocaleTimeString();
    console.log(chalk.bold.cyan(`[${timestamp}] Running tests...\n`));

    const child = execFile(
      process.execPath,
      [...process.execArgv, ...nodeArgs],
      { cwd: process.cwd(), env: process.env, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);

        console.log(
          chalk.bold.cyan(
            `\n[${new Date().toLocaleTimeString()}] Watching for changes... (Ctrl+C to stop)`,
          ),
        );

        running = false;

        if (queued) {
          queued = false;
          runTests();
        }
      },
    );
  }

  // Initial run
  runTests();

  // Debounce: ignore rapid-fire events within 250ms
  let debounceTimer = null;

  // Also watch `src/` directory if it exists (framework source changes)
  const dirsToWatch = [watchDir];
  const srcDir = path.resolve('src');
  if (fs.existsSync(srcDir) && srcDir !== watchDir) {
    dirsToWatch.push(srcDir);
  }

  for (const dir of dirsToWatch) {
    try {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;

        // Only react to JS/MJS files
        if (!filename.endsWith('.js') && !filename.endsWith('.mjs')) return;

        // Ignore node_modules and dist
        if (filename.includes('node_modules') || filename.includes('dist'))
          return;

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(chalk.yellow(`\n  File changed: ${filename}`));
          runTests();
        }, 250);
      });
    } catch (err) {
      console.warn(chalk.yellow(`Could not watch ${dir}: ${err.message}`));
    }
  }

  console.log(
    chalk.bold.cyan(`Watching ${dirsToWatch.join(', ')} for changes...`),
  );
}
