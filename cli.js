#!/usr/bin/env node

import { runCodi } from './src/testRunner.js';

console.log('CLI starting...');
try {
  await runCodi();
} catch (error) {
  console.error('Error running tests:', error);
}
