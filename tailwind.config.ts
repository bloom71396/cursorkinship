import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./**/*.{js,ts,jsx,tsx,mdx}",

    // extra explicit, in case the project root is nested
    "./**/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./**/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: { extend: {} },
  plugins: [],
};

export default config;
