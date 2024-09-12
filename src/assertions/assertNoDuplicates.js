import chalk from "chalk";

export function assertNoDuplicates(arr, message) {
    //Filter array until for duplicate entries
    arr = arr.filter((item, index) => arr.indexOf(item) !== index)
    if (arr.length > 0) {
        throw new Error(message || `Duplicates found: ${chalk.bold.yellow(arr)}`);
    }
}