module.exports = [
  {
    files: ["./src/**/*.js"],
    languageOptions: { ecmaVersion: 2020, sourceType: "script" },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"],
    },
  },
];