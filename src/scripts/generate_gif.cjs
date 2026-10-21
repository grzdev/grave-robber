const fs = require('fs');
const path = require('path');
const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const width = 480;
const height = 220;
const totalFrames = 36;
const delay = 65; // ~15 fps

const gif = GIFEncoder();

function createFrameBuffer() {
  return new Uint8Array(width * height * 4);
}

function setPixel(buf, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  if (a === 255) {
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = 255;
  } else {
    const alpha = a / 255;
    buf[idx] = Math.round(buf[idx] * (1 - alpha) + r * alpha);
    buf[idx + 1] = Math.round(buf[idx + 1] * (1 - alpha) + g * alpha);
    buf[idx + 2] = Math.round(buf[idx + 2] * (1 - alpha) + b * alpha);
    buf[idx + 3] = 255;
  }
}

function fillRect(buf, rx, ry, rw, rh, r, g, b, a = 255) {
  const x0 = Math.max(0, Math.floor(rx));
  const x1 = Math.min(width, Math.floor(rx + rw));
  const y0 = Math.max(0, Math.floor(ry));
  const y1 = Math.min(height, Math.floor(ry + rh));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      setPixel(buf, x, y, r, g, b, a);
    }
  }
}

function strokeRect(buf, rx, ry, rw, rh, r, g, b) {
  fillRect(buf, rx, ry, rw, 1, r, g, b);
  fillRect(buf, rx, ry + rh - 1, rw, 1, r, g, b);
  fillRect(buf, rx, ry, 1, rh, r, g, b);
  fillRect(buf, rx + rw - 1, ry, 1, rh, r, g, b);
}

function fillCircle(buf, cx, cy, radius, r, g, b, a = 255) {
  const r2 = radius * radius;
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(width, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(height, Math.ceil(cy + radius));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dist = (x - cx) ** 2 + (y - cy) ** 2;
      if (dist <= r2) {
        setPixel(buf, x, y, r, g, b, a);
      }
    }
  }
}

function radialGlow(buf, cx, cy, maxRadius, r, g, b, maxAlpha = 180) {
  const x0 = Math.max(0, Math.floor(cx - maxRadius));
  const x1 = Math.min(width, Math.ceil(cx + maxRadius));
  const y0 = Math.max(0, Math.floor(cy - maxRadius));
  const y1 = Math.min(height, Math.ceil(cy + maxRadius));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < maxRadius) {
        const falloff = 1 - dist / maxRadius;
        const a = Math.round(falloff * falloff * maxAlpha);
        setPixel(buf, x, y, r, g, b, a);
      }
    }
  }
}

console.log('Generating retro gameplay GIF frames...');

for (let frame = 0; frame < totalFrames; frame++) {
  const buf = createFrameBuffer();

  // Background Stone wall
  fillRect(buf, 0, 0, width, height, 9, 6, 15);

  // Subtle brick grid
  for (let y = 0; y < height; y += 28) {
    fillRect(buf, 0, y, width, 1, 20, 15, 32);
  }
  for (let x = 0; x < width; x += 56) {
    fillRect(buf, x, 0, 1, height, 20, 15, 32);
  }

  // Torches on wall
  const torches = [{ x: 50, y: 70 }, { x: 430, y: 70 }];
  torches.forEach(t => {
    // Sconce
    fillRect(buf, t.x - 2, t.y, 4, 14, 60, 45, 30);
    // Glow
    radialGlow(buf, t.x, t.y - 6, 40, 245, 158, 11, 70);
    // Flame
    fillCircle(buf, t.x, t.y - 6, 5, 245, 158, 11);
    fillCircle(buf, t.x, t.y - 6, 2, 254, 240, 138);
  });

  // Platforms
  // Ground floor
  fillRect(buf, 0, 175, width, 45, 20, 15, 32);
  strokeRect(buf, 0, 175, width, 45, 45, 35, 65);
  fillRect(buf, 0, 175, width, 2, 60, 50, 80);

  // Stepping stone (x: 200, y: 135, w: 60, h: 12)
  fillRect(buf, 200, 135, 60, 12, 28, 22, 44);
  strokeRect(buf, 200, 135, 60, 12, 65, 52, 90);
  fillRect(buf, 200, 135, 60, 2, 85, 70, 115);

  // Dais for Tomb (x: 320, y: 110, w: 85, h: 65)
  fillRect(buf, 320, 110, 85, 65, 25, 18, 40);
  strokeRect(buf, 320, 110, 85, 65, 65, 50, 95);
  fillRect(buf, 320, 110, 85, 3, 90, 75, 125);

  // Sarcophagus Tomb (x: 345, y: 88, w: 35, h: 22)
  radialGlow(buf, 362, 98, 45, 168, 85, 247, 50);
  fillRect(buf, 345, 88, 35, 22, 38, 28, 58);
  strokeRect(buf, 345, 88, 35, 22, 168, 85, 247);
  fillCircle(buf, 362, 88, 10, 48, 36, 72);

  // Calculate Character Position (Physics curve for run & jump)
  let px, py;
  const progress = frame / totalFrames;

  if (progress < 0.25) {
    // Phase 1: Running on floor towards step (x: 50 -> 140, y: 147)
    const subP = progress / 0.25;
    px = 50 + subP * 90;
    py = 147;
  } else if (progress < 0.55) {
    // Phase 2: Jumping in an arc up onto the stepping stone
    const subP = (progress - 0.25) / 0.30;
    px = 140 + subP * 75; // lands at x: 215
    // Parabolic arc: peak in the middle
    const arcHeight = Math.sin(subP * Math.PI) * 45;
    py = (147 * (1 - subP) + 107 * subP) - arcHeight;
  } else if (progress < 0.80) {
    // Phase 3: Walking across the step and leaping to the tomb dais
    const subP = (progress - 0.55) / 0.25;
    px = 215 + subP * 115; // lands at x: 330
    const hop = Math.sin(subP * Math.PI) * 20;
    py = (107 * (1 - subP) + 82 * subP) - hop;
  } else {
    // Phase 4: Standing at the tomb, inspecting & plundering!
    px = 330;
    py = 82;

    // Glowing Inspect Key HUD
    fillRect(buf, 305, 52, 65, 18, 20, 15, 32);
    strokeRect(buf, 305, 52, 65, 18, 168, 85, 247);
    // Mini prompt dot
    fillCircle(buf, 315, 61, 3, 52, 211, 153);
    // Gold spark
    if (frame % 4 < 2) {
      fillCircle(buf, 365, 78, 2, 251, 191, 36);
    }
  }

  // Draw Grave Robber Character
  const ipx = Math.floor(px);
  const ipy = Math.floor(py);

  // Lantern light radius
  radialGlow(buf, ipx + 22, ipy + 16, 50, 254, 240, 138, 75);

  // Cloak body
  fillRect(buf, ipx + 4, ipy + 8, 14, 20, 59, 29, 96);
  fillRect(buf, ipx + 2, ipy + 24, 18, 4, 38, 18, 64);

  // Hood / Head
  fillCircle(buf, ipx + 11, ipy + 6, 6, 33, 14, 56);
  // Glowing Cyan Eyes
  fillRect(buf, ipx + 13, ipy + 5, 2, 2, 34, 211, 238);
  fillRect(buf, ipx + 16, ipy + 5, 2, 2, 34, 211, 238);

  // Golden Lantern in Hand
  fillRect(buf, ipx + 20, ipy + 13, 5, 7, 180, 83, 9);
  fillCircle(buf, ipx + 22, ipy + 16, 2, 254, 240, 138);

  // Quantize frame & write to GIF
  const palette = quantize(buf, 64);
  const index = applyPalette(buf, palette);
  gif.writeFrame(index, width, height, { palette, delay });
}

gif.finish();

const outPath = path.join(__dirname, '..', '..', 'public', 'gameplay.gif');
fs.writeFileSync(outPath, Buffer.from(gif.bytes()));
console.log('Saved animated gameplay GIF to:', outPath);
