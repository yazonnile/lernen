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
  routes: path.resolve(root, './src/routes'),
};

module.exports = {
  input: [
    'src/index.ts',
    'src/sw.ts',
  ],
  output: {
    dir: folders.dist,
    sourcemap: !production,
    format: 'es',
  },
  watch: { clearScreen: false },
  plugins: [
    require('@rollup/plugin-alias')({
      entries: folders,
      resolve: ['.ts', '.js', '.svelte']
    }),

    require('rollup-plugin-node-resolve')({
      browser: true,
      mainFields: ['svelte', 'browser', 'module', 'main'],
      extensions: ['.mjs', '.ts', '.js', '.svelte', '.css'],
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
      'process.env.DEV': JSON.stringify(!production)
    }),

    require('rollup-plugin-postcss')({
      extract: true
    }),

    require('rollup-plugin-cleaner')({
      targets: [ folders.dist ]
    }),

    require('rollup-plugin-copy')({
      targets: [
        { src: 'src/static/*', dest: folders.dist }
      ],
      flatten: false
    })
  ]
};
