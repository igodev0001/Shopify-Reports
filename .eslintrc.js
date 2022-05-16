module.exports = {
  extends: [
    "plugin:shopify/react",
    "plugin:shopify/polaris",
    "plugin:shopify/jest",
    "plugin:shopify/webpack",
  ],
  rules: {
    "import/no-unresolved": "off",
    allowTemplateLiterals: true,
  },
  overrides: [
    {
      files: ["*.test.*"],
      rules: {
        "shopify/jsx-no-hardcoded-content": "off",
      },
    },
  ],
};
