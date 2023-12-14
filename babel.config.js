module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
  extensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.cjs', '.ts'],
  plugins: ["@babel/plugin-proposal-class-properties"],
};
