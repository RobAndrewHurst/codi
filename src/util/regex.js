export function excludePattern(patterns) {
    return (str) => {
        return patterns.some(pattern => {
            // Escape special regex characters in the pattern
            const regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Create a regex that matches the pattern at the start, optionally followed by '/'
            const regex = new RegExp(`^${regexPattern}($|/)`);
            return !regex.test(str);
        });
    };
}