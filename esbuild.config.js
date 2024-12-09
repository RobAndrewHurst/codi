import * as esbuild from 'esbuild';

// Build for browser
await esbuild.build({
    entryPoints: ['./src/_codi.js'],
    bundle: true,
    outfile: 'dist/web.js',
    format: 'esm',
    platform: 'browser',
    external: ['chalk', 'figlet'], // External dependencies
    define: {
        'process.env.NODE_ENV': '"production"'
    }
})