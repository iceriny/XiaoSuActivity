// rollup.config.js
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import progress from 'rollup-plugin-progress';
import packageJson from "./package.json" assert { type: "json" };
import json from "@rollup/plugin-json";
import changeLog from "changeLog.json" assert { type: "json" };

export default {
  input: 'src/main.ts', // 入口文件路径
  output: {
    file: 'dist/XSActivity.js', // 输出文件路径
    format: 'iife', // 输出格式
    sourcemap: true,
    name: 'XiaoSuActivity', // 全局变量名称
    intro: async () => {
      let XSActivity_VERSION = packageJson.version;
      XSActivity_VERSION = (XSActivity_VERSION.length > 0 && XSActivity_VERSION[0] == 'v') ? XSActivity_VERSION : "v" + XSActivity_VERSION;
      return `const XSActivity_VERSION="${XSActivity_VERSION}";
      const DEBUG=false;`;
    },
    plugins: [terser({
      mangle: false
    })]
  },
  plugins: [
    progress({ clearLine: true }),
    resolve({ browser: true }),
    typescript({ tsconfig: "./tsconfig.json", inlineSources: true }), // 使用 TypeScript 插件
    commonjs(),
    json()
  ]
};
