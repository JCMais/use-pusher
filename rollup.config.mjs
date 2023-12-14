import commonjs from "@rollup/plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import url from "@rollup/plugin-url";
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json" assert { type: "json" };

const plugins = [
  external(),
  url({ exclude: ["**/*.svg"] }),
  // resolve(),
  // commonjs(),
  typescript({
    tsconfig: './tsconfig.json', 
    declaration: true,
    declarationDir: 'dist',
  }),
  // babel({
  //   extensions: [".tsx", ".ts"],
  //   exclude: ["node_modules/**", "./src/__tests__"],
  //   presets: ["@babel/env", "@babel/preset-react"],
  // }),
  // typescript({
  //   rollupCommonJSResolveHack: true,
  //   clean: true,
  //   exclude: ["./src/__tests__/*"],
  // }),
  // babel({
  //   extensions: [".tsx"],
  //   exclude: ["node_modules/**", "./src/__tests__"],
  //   presets: ["@babel/env", "@babel/preset-react"],
  // }),
];

export default [
  {
    input: "src/web/index.ts",
    external: ["pusher-js"],
    plugins,
    output: [
      {
        file: pkg.main,
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "es",
        exports: "named",
        sourcemap: true,
      },
      // {
      //   // build into our example app for testing with a real client
      //   file: "examples/web/src/use-pusher/index.js",
      //   format: "es",
      //   exports: "named",
      //   sourcemap: true,
      // },
    ],
  },
  {
    input: "src/native/index.ts",
    external: ["pusher-js", "react-native"],
    plugins,
    output: [
      {
        // allows users to import from @harelpls/use-pusher/react-native
        file: "react-native/index.js",
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
      {
        file: "examples/native-use-pusher-example/use-pusher/native/index.js",
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
    ],
  },
];
