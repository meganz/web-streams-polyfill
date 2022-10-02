const path = require('path');

const typescript = require('@rollup/plugin-typescript');
const inject = require('@rollup/plugin-inject');
const strip = require('@rollup/plugin-strip');
const replace = require('@rollup/plugin-replace');
const { terser } = require('rollup-plugin-terser');
import cleanup from 'rollup-plugin-cleanup';

const debug = false;

const pkg = require('./package.json');
const banner = `
/**
 * ${pkg.name} v${pkg.version}.meganz
 */
`.trim();

const keepNames = [
  // Class names
  'ReadableStream',
  'ReadableStreamDefaultController',
  'ReadableByteStreamController',
  'ReadableStreamBYOBRequest',
  'ReadableStreamDefaultReader',
  'ReadableStreamBYOBReader',
  'WritableStream',
  'WritableStreamDefaultWriter',
  'WritableStreamDefaultController',
  'ByteLengthQueuingStrategy',
  'CountQueuingStrategy',
  'TransformStream',
  'TransformStreamDefaultController',
  // Queuing strategy "size" getter
  'size'
];
const keepRegex = new RegExp(`^(${keepNames.join('|')})$`);

function bundle(entry, { esm = false, minify = false, target = 'es5' } = {}) {
  const outname = `${pkg.name}${target === 'es2018' ? '' : `.${target}`}`;
  return {
    input: `src/${entry}.ts`,
    output: [
      {
        file: `dist/${outname}${minify ? '.min' : ''}.js`,
        format: 'umd',
        name: 'WebStreamsPolyfill',
        banner,
        freeze: true,
        sourcemap: false
      },
      esm ? {
        file: `dist/${outname}${minify ? '.min' : ''}.mjs`,
        format: 'es',
        banner,
        freeze: false,
        sourcemap: true
      } : undefined
    ].filter(Boolean),
    plugins: [
      typescript({
        tsconfig: `tsconfig${target === 'es5' ? '' : `-${target}`}.json`,
        declaration: false,
        declarationMap: false
      }),
      inject({
        include: 'src/**/*.ts',
        exclude: target === 'es2018' ? 'src/stub/*.ts' : 'src/stub/symbol.ts',
        modules: target === 'es2018' ? {} : {
          Symbol: path.resolve(__dirname, './src/stub/symbol.ts')
        }
      }),
      replace({
        include: 'src/**/*.ts',
        preventAssignment: true,
        values: {
          DEBUG: debug
        }
      }),
      !debug ? strip({
        include: 'src/**/*.ts',
        functions: ['assert'],
        sourceMap: true
      }) : undefined,
      minify ? terser({
        keep_classnames: keepRegex, // needed for WPT
        keep_fnames: keepRegex,
        mangle: {
          toplevel: true
        }
      }) : cleanup({
        comments: 'none',
        sourcemap: false,
        extensions: ['js', 'ts']
      })
    ].filter(Boolean)
  };
}

module.exports = [
  bundle('polyfill', { target: 'es2018' })
];

/**
module.exports = [
  // polyfill
  bundle('polyfill', { esm: true }),
  bundle('polyfill', { minify: true }),
  // polyfill/es6
  bundle('polyfill', { target: 'es6', esm: true }),
  bundle('polyfill', { target: 'es6', minify: true }),
  // polyfill/es2018
  bundle('polyfill', { target: 'es2018', esm: true }),
  bundle('polyfill', { target: 'es2018', minify: true }),
  // ponyfill
  bundle('ponyfill', { esm: true }),
  // ponyfill/es6
  bundle('ponyfill', { target: 'es6', esm: true }),
  // ponyfill/es2018
  bundle('ponyfill', { target: 'es2018', esm: true })
];
/**/
