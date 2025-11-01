{
  "root": true,
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react/recommended"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "ecmaFeatures": { "jsx": true }
  },
  "plugins": ["@typescript-eslint", "react"],
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "TSAsExpression[expression.type='Identifier'][typeAnnotation.type='TSAnyKeyword']",
        "message": "Avoid casting to 'any' with 'as any'. Prefer proper types or a typed helper."
      }
    ],
    "@typescript-eslint/no-explicit-any": ["warn", { "ignoreRestArgs": true }]
  },
  "settings": { "react": { "version": "detect" } }
}
