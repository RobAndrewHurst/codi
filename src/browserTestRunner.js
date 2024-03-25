import express from 'express';
import open from 'open';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mime from 'mime';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runBrowser(testDirectory) {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Read all .mjs files in the test directory
  const testFiles = fs.readdirSync(path.join(testDirectory)).filter(file => file.endsWith('.mjs'));

  // Configure MIME type for .mjs files
  mime.define({ 'application/javascript': ['mjs'] });

  // Serve the test files and other static files
  app.use(express.static(testDirectory, {
    setHeaders: (res, path) => {
      if (path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
    }
  }));

  // Create a route to serve the browser runner HTML file
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'browser-runner.html'));
  });

  // Start the server and listen for incoming requests
  const server = app.listen(PORT, () => {
    console.log(chalk.bold.magenta(`Server is running on http://localhost:${PORT}`));

    // Open the browser to the server URL
    open(`http://localhost:${PORT}`);
  });

  console.log(chalk.bold.magenta(`\nRunning tests in directory: ${chalk.underline(testDirectory)}`));
  console.log(chalk.bold.magenta(`Found ${testFiles.length} test file(s)\n`));

  // Print the test summary (you can add your test logic here)
  console.log(chalk.bold.cyan('\nTest Summary:'));
  console.log(chalk.green('  This is the start of the browser!'));

  // Close the server after tests are complete
  //server.close();
}

export function testBrowser() {
  const testDirectory = process.argv[2];

  if (!testDirectory) {
    console.error(chalk.red('Please provide a test directory as an argument.'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('='.repeat(40)));
  console.log(chalk.bold.cyan('Running tests...'));
  console.log(chalk.bold.cyan('='.repeat(40)));

  runBrowser(testDirectory);
}