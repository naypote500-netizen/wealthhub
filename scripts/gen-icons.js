/**
 * Generate WealthHub app icons (logo192.png, logo512.png, favicon)
 * Run: node scripts/gen-icons.js
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "public");

// Master SVG (512x512). Sharp will downscale for 192.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="coin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fde68a"/>
      <stop offset="1" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
      <feOffset dx="0" dy="6" result="offsetblur"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Rounded square background (Apple squircle ratio ~22%) -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>

  <!-- Subtle radial highlight top-left -->
  <circle cx="160" cy="140" r="180" fill="#ffffff" opacity="0.08"/>

  <!-- Bold W letter -->
  <text x="256" y="362" font-family="'Segoe UI','Arial',sans-serif" font-size="340" font-weight="800" text-anchor="middle" fill="#ffffff" filter="url(#shadow)">W</text>

  <!-- Wealth coin accent (top-right) -->
  <g filter="url(#shadow)">
    <circle cx="396" cy="124" r="38" fill="url(#coin)"/>
    <text x="396" y="143" font-family="'Segoe UI','Arial',sans-serif" font-size="44" font-weight="800" text-anchor="middle" fill="#92400e">฿</text>
  </g>
</svg>`;

const svgBuf = Buffer.from(svg);

(async()=>{
  // 512
  await sharp(svgBuf).resize(512,512).png({compressionLevel:9}).toFile(path.join(OUT,"logo512.png"));
  console.log("✓ logo512.png");

  // 192
  await sharp(svgBuf).resize(192,192).png({compressionLevel:9}).toFile(path.join(OUT,"logo192.png"));
  console.log("✓ logo192.png");

  // Apple touch icon (180x180 — recommended size)
  await sharp(svgBuf).resize(180,180).png({compressionLevel:9}).toFile(path.join(OUT,"apple-touch-icon.png"));
  console.log("✓ apple-touch-icon.png");

  // Favicon as PNG (modern browsers accept this) — 64x64
  await sharp(svgBuf).resize(64,64).png({compressionLevel:9}).toFile(path.join(OUT,"favicon-64.png"));
  console.log("✓ favicon-64.png");

  // Save the master SVG too (handy for future tweaks)
  fs.writeFileSync(path.join(OUT,"icon.svg"),svg);
  console.log("✓ icon.svg (master)");

  console.log("\nDone! Icons written to public/");
})().catch(e=>{console.error(e);process.exit(1)});
