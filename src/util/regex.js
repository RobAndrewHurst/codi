export function excludePattern(patterns) {
    return (path) => {
        return patterns.some(pattern => {
            // Normalize path separators
            const normalizedPattern = pattern.replace(/[\\/]+/g, '/');
            const normalizedPath = path.replace(/[\\/]+/g, '/');

            // Escape special regex characters in the pattern
            const regexPattern = normalizedPattern
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .replace(/\//g, '[\\\\/]'); // Allow both / and \ as separators

            // Create a regex that matches the pattern at the start, optionally followed by a separator
            const regex = new RegExp(`^${regexPattern}($|[\\\\/])`);
            return regex.test(normalizedPath);
        });
    };
}