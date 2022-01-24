import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/dist.js',
    name: 'webReport',
    format: 'umd'
  },
  plugins: [
    commonjs(),
    nodeResolve({
      browser: true,
    }),
    typescript()
  ]
}