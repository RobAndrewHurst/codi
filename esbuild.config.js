import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['./src/_codi.js'],
    bundle: true,
    outfile: 'browser.js',
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    external: ['chalk', 'figlet']
});