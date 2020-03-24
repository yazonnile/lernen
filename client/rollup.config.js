const production = !process.env.ROLLUP_WATCH;
const path = require('path');

const devServerOptions = {
  protocol: 'http',
  host: 'localhost',
  port: '4000'
};
const root = __dirname;
const buildPath = p => path.resolve(root, p);
const folders = {
  root,
  dist: buildPath('public'),
  src: buildPath('src'),
  sdk: path.resolve(root, './src/sdk'),
  stores: path.resolve(root, './src/stores'),
  lib: path.resolve(root, './src/lib'),
  api: path.resolve(root, './src/api'),
  views: path.resolve(root, './src/views'),
  buildDist: path.resolve(root, '../', 'server/src/public'),
};

module.exports = {
  input: [
    'src/index.ts',
    'src/sw.ts',
  ],
  output: {
    dir: production ? folders.buildDist : folders.dist,
    sourcemap: !production,
    format: 'es',
  },

  watch: { clearScreen: false },

  plugins: [
    require('@rollup/plugin-alias')({
      entries: folders,
      resolve: ['.ts', '.js', '.svelte', '.svg']
    }),

    require('rollup-plugin-node-resolve')({
      browser: true,
      mainFields: ['svelte', 'browser', 'module', 'main'],
      extensions: ['.mjs', '.ts', '.js', '.svelte', '.css', '.svg'],
      dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
    }),

    require('rollup-plugin-commonjs')(),

    require('rollup-plugin-typescript2')({
      typescript: require('typescript'),
      objectHashIgnoreUnknownHack: true,
    }),

    require('rollup-plugin-svelte')({
      dev: !production,
      preprocess: require('svelte-preprocess')({
        postcss: true
      })
    }),

    !production && require('rollup-plugin-livereload')(folders.dist),

    !production && require('rollup-plugin-serve')({
      open: true,
      host: devServerOptions.host,
      port: devServerOptions.port,
      contentBase: folders.dist
    }),

    require('@rollup/plugin-replace')({
      'process.env.DEV': JSON.stringify(!production),
      'process.env.VERSION': JSON.stringify(Date.now())
    }),

    require('rollup-plugin-postcss')({
      extract: true
    }),

    production && require('rollup-plugin-cleaner')({
      targets: [ folders.buildDist ]
    }),

    require('rollup-plugin-copy')({
      targets: [
        { src: ['src/static/*', '!**/*.html'], dest: production ? folders.buildDist : folders.dist },
        { src: `src/static/index.${production ? 'build' : 'dev'}.html`, dest: production ? folders.buildDist : folders.dist, rename: 'index.html' }
      ]
    }),

    require('rollup-plugin-svg')()
  ]
};
