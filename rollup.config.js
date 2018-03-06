const path = require('path');

const rollupCommonJS = require('rollup-plugin-commonjs');
const rollupAlias = require('rollup-plugin-alias');
const rollupBabel = require('rollup-plugin-babel');
const rollupStrip = require('rollup-plugin-strip');
const rollupUglify = require('rollup-plugin-uglify');

function buildConfig(entry, { esm = false, minify = false, wpt = false } = {}) {
  const suffix = `${wpt ? '.wpt' : ''}${minify ? '.min' : ''}`;
  return {
    input: `src/${entry}.js`,
    output: [
      {
        file: `dist/${entry}${suffix}.js`,
        format: 'umd',
        freeze: false,
        sourcemap: true,
        name: 'WebStreamsPolyfill'
      },
      esm ? {
        file: `dist/${entry}${suffix}.es.js`,
        format: 'es',
        freeze: false,
        sourcemap: true
      } : undefined
    ].filter(Boolean),
    plugins: [
      rollupCommonJS({
        include: 'spec/reference-implementation/lib/*.js'
      }),
      minify ? rollupStrip({
        functions: ['assert', 'debug', 'verbose']
      }) : undefined,
      rollupAlias(minify ? {
        'better-assert': path.resolve(__dirname, './src/stub/min/better-assert.js'),
        'debug': path.resolve(__dirname, './src/stub/min/debug.js')
      } : {
        'better-assert': path.resolve(__dirname, './src/stub/no-min/better-assert.js'),
        'debug': path.resolve(__dirname, './src/stub/no-min/debug.js')
      }),
      (!wpt) ? rollupBabel() : undefined,
      (minify || wpt) ? rollupUglify({
        keep_classnames: true, // needed for WPT
        compress: {
          inline: 1 // TODO re-enable when this is fixed: https://github.com/mishoo/UglifyJS2/issues/2842
        }
      }) : undefined
    ].filter(Boolean)
  };
}

module.exports = [
  buildConfig('polyfill', { esm: true }),
  buildConfig('polyfill', { minify: true }),
  buildConfig('polyfill', { wpt: true }),
  buildConfig('ponyfill', { esm: true })
];
