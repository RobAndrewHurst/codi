import chalk from "chalk";

export function describe(description, callback) {
    console.log(chalk.bold.cyan(`\n${description}`));
    callback();
  }
  
  export function it(description, callback) {
    try {
      callback();
      console.log(chalk.green(`  ✅ ${description}`));
      PASSED_TESTS++;
    } catch (error) {
      console.error(chalk.red(`  ⛔ ${description}`));
      console.error(chalk.red(`    ${error.message}`));
      FAILED_TESTS++;
    }
  }