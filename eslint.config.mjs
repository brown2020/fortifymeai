import { fixupConfigRules } from "@eslint/compat";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.FlatConfig[]} */
const config = [
  ...fixupConfigRules([...nextCoreWebVitals, ...nextTypescript]),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
