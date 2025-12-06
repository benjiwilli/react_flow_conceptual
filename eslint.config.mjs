import nextPlugin from "@next/eslint-plugin-next"
import tseslint from "typescript-eslint"
import reactHooksPlugin from "eslint-plugin-react-hooks"

export default [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "prefer-const": "warn",
      "no-var": "off",
    },
  },
]
