import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // This rule is overly strict for typical client-side React patterns (async fetch → setState).
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;

