const path = require("path");
const fs = require("fs");
const logo = require("./public/logo.svg");

// Helper function to read SVG and return data URL
function getSvgDataUrl(filePath) {
  const svgContent = fs.readFileSync(filePath, "utf-8");
  const encoded = Buffer.from(svgContent).toString("base64");
  return `url("data:image/svg+xml;base64,${encoded}")`;
}

const svgDir = path.join(__dirname, "public");
const heroBg = getSvgDataUrl(path.join(svgDir, "hero-bg.svg"));
const animatedBg = getSvgDataUrl(path.join(svgDir, "animated-bg.svg"));
const cardPattern = getSvgDataUrl(path.join(svgDir, "card-pattern.svg"));
const buttonGradient = getSvgDataUrl(path.join(svgDir, "button-gradient.svg"));
const gradientBg = getSvgDataUrl(path.join(svgDir, "gradient-bg.svg"));

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, "app/**/*.{js,jsx}"),
    path.join(__dirname, "components/**/*.{js,jsx}"),
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          500: "#0ea5e9",
          600: "#0284c7",
          900: "#0c4a6e",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero': heroBg,
        'animated': animatedBg,
        'card-pattern': cardPattern,
        'button-gradient': buttonGradient,
        'gradient-bg': gradientBg,
      },
      animation: {
        'fade-in': 'fadeInUp 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in': 'slideInBackground 15s linear infinite',
      },
      backgroundSize: {
        'full': '100% 100%',
      },
    },
  },
  plugins: [],
};