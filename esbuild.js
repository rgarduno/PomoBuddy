const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

async function main() {
  const ctx = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [
      {
        name: 'esbuild-problem-matcher',
        setup(build) {
          build.onStart(() => {
            console.log('[esbuild] Iniciando compilación...');
          });
          build.onEnd((result) => {
            result.errors.forEach((error) =>
              console.error(`> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`)
            );
            console.log('[esbuild] Compilación terminada con éxito.');
          });
        },
      },
    ],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
