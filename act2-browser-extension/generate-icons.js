const { createCanvas } = require("canvas");
const fs = require("fs");

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#cc0000";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.18);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.45}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RH", size / 2, size / 2);

  fs.writeFileSync(filename, canvas.toBuffer("image/png"));
  console.log(`Generated ${filename}`);
}

generateIcon(48, "icon48.png");
generateIcon(128, "icon128.png");
