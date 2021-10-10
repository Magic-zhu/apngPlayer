import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";

export default [{
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/apng-player-iife.min.js',
      format: 'iife',
      name:"ApngPlyer",
    },
    {
      file: 'dist/apng-player-es.min.js',
      format: 'esm'
    },
    {
      file: 'dist/apng-player-umd.min.js',
      format: 'umd',
      name:"ApngPlyer",
    }
  ],
  plugins: [
    typescript(),
    terser(),
  ],
},
]

