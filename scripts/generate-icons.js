const { createCanvas } = (() => {
  try { return require("canvas"); } catch { return { createCanvas: null }; }
})();

const fs = require("fs");
const path = require("path");

function generateSVG(size) {
  const r = Math.round(size * 0.167);
  const dotR = Math.round(size * 0.073);
  const cx1 = Math.round(size * 0.354);
  const cx2 = Math.round(size * 0.542);
  const cy1 = Math.round(size * 0.417);
  const cy2 = Math.round(size * 0.604);
  const fontSize = Math.round(size * 0.125);
  const textY = Math.round(size * 0.865);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#0A1628"/>
  <circle cx="${cx1}" cy="${cy1}" r="${dotR}" fill="#2563EB"/>
  <circle cx="${cx2}" cy="${cy1}" r="${dotR}" fill="#16A34A"/>
  <circle cx="${cx1}" cy="${cy2}" r="${dotR}" fill="#F59E0B"/>
  <circle cx="${cx2}" cy="${cy2}" r="${dotR}" fill="#EA580C"/>
  <text x="${size/2}" y="${textY}" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="${fontSize}" fill="white">BOCRA</text>
</svg>`;
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const svg = generateSVG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.svg`), svg);
  console.log(`Generated icon-${size}.svg`);
}

console.log("Icons generated. For PNG conversion, use an online SVG-to-PNG tool or install the 'canvas' npm package.");
