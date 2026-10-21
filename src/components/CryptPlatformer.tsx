import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { Tomb } from '../types/tari';
import { sounds } from '../services/soundEffects';
import { Key, Sparkles, Compass } from 'lucide-react';

interface CryptPlatformerProps {
  tombs: Tomb[];
  onSelectTomb: (tomb: Tomb) => void;
  onOpenBuryModal: () => void;
}

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  isStair?: boolean;
}

/**
 * Procedural stair generator for crypt tombs.
 * Generates randomized climbing stepping stones with varied heights and widths.
 */
function generateProceduralPlatforms(seed: number): Platform[] {
  const list: Platform[] = [
    // Ground floor
    { x: 0, y: 400, w: 1900, h: 60 },
  ];

  // Pseudo-random helper from seed
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  let curX = 0;
  let curY = 0;

  // Station 1: Clean ascent leading to Tomb 1 (Tomb 1 is at x: 280, y: 330)
  // Stepping stones strictly before the dais, no rogue step behind it
  list.push({ x: 130, y: 375, w: 55, h: 14, isStair: true });
  list.push({ x: 195, y: 350, w: 50, h: 14, isStair: true });
  // Tomb 1 main dais (spans x: 255 to 350)
  list.push({ x: 255, y: 330, w: 95, h: 16 });

  // Station 2: Clear gap after Tomb 1, then climb to Tomb 2 (x: 650, y: 200)
  const steps2Count = 3 + Math.floor(rnd() * 2); // 3 or 4 steps
  curX = 420;
  curY = 380;
  for (let i = 0; i < steps2Count; i++) {
    const w = 55 + Math.floor(rnd() * 20);
    curX += 45 + Math.floor(rnd() * 12);
    curY -= 38 + Math.floor(rnd() * 8);
    list.push({ x: curX, y: curY, w, h: 14, isStair: true });
  }
  // Tomb 2 main dais (spans x: 620 to 715)
  list.push({ x: 620, y: 200, w: 95, h: 16 });

  // Station 3: Leading to Tomb 3 (Arch-Lich Sanctum) (x: 1040, y: 110) - Highest climb
  const steps3Count = 4 + Math.floor(rnd() * 2); // 4 or 5 steps
  curX = 760;
  curY = 380;
  for (let i = 0; i < steps3Count; i++) {
    const w = 55 + Math.floor(rnd() * 20);
    curX += 50 + Math.floor(rnd() * 15);
    curY -= 48 + Math.floor(rnd() * 8);
    list.push({ x: curX, y: curY, w, h: 14, isStair: true });
  }
  // Tomb 3 main dais
  list.push({ x: 1010, y: 110, w: 100, h: 16 });

  // Station 4: Descent and climb to Tomb 4 (x: 1420, y: 320)
  curX = 1170;
  curY = 220;
  list.push({ x: curX, y: curY, w: 75, h: 14, isStair: true });
  curX += 85;
  curY += 50;
  list.push({ x: curX, y: curY, w: 70, h: 14, isStair: true });
  curX += 80;
  curY += 45;
  list.push({ x: curX, y: curY, w: 75, h: 14, isStair: true });
  // Tomb 4 dais
  list.push({ x: 1390, y: 320, w: 95, h: 16 });

  // Altar platform at far right
  list.push({ x: 1640, y: 350, w: 140, h: 40 });

  return list;
}

export const CryptPlatformer: React.FC<CryptPlatformerProps> = ({
  tombs,
  onSelectTomb,
  onOpenBuryModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Procedural platforms
  const platforms = useMemo(() => generateProceduralPlatforms(42), []);

  // Target detection
  const [nearbyTomb, setNearbyTomb] = useState<Tomb | null>(null);
  const [nearAltar, setNearAltar] = useState<boolean>(false);

  // Player physics
  const playerRef = useRef({
    x: 80,
    y: 340,
    vx: 0,
    vy: 0,
    w: 24,
    h: 36,
    isGrounded: false,
    facingRight: true,
  });

  const worldWidth = 1880;
  const worldHeight = 460;
  const altarX = 1680;

  // Wall Torches
  const torches = [
    { x: 120, y: 250 },
    { x: 300, y: 190 },
    { x: 520, y: 150 },
    { x: 740, y: 100 },
    { x: 960, y: 80 },
    { x: 1180, y: 160 },
    { x: 1380, y: 240 },
    { x: 1580, y: 260 },
    { x: 1780, y: 220 },
  ];

  // Key tracking
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; interact: boolean }>({
    left: false,
    right: false,
    up: false,
    interact: false,
  });

  const cameraXRef = useRef(0);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        if (playerRef.current.isGrounded) {
          keysRef.current.up = true;
          playerRef.current.vy = -11.8;
          playerRef.current.isGrounded = false;
          sounds.playJump();
        }
      }
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        keysRef.current.interact = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') keysRef.current.up = false;
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') keysRef.current.interact = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Render & Physics Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let stepTimer = 0;

    const loop = () => {
      frameCount++;
      const p = playerRef.current;
      const keys = keysRef.current;

      // 1. Horizontal movement
      const speed = 3.6;
      if (keys.left) {
        p.vx = -speed;
        p.facingRight = false;
        if (p.isGrounded && ++stepTimer % 18 === 0) sounds.playStep();
      } else if (keys.right) {
        p.vx = speed;
        p.facingRight = true;
        if (p.isGrounded && ++stepTimer % 18 === 0) sounds.playStep();
      } else {
        p.vx *= 0.78;
      }

      // 2. Vertical movement & gravity
      p.vy += 0.55;
      if (p.vy > 12) p.vy = 12;

      p.x += p.vx;
      if (p.x < 10) p.x = 10;
      if (p.x > worldWidth - p.w - 10) p.x = worldWidth - p.w - 10;

      p.y += p.vy;

      // 3. Platform collisions
      p.isGrounded = false;
      for (const plat of platforms) {
        if (
          p.x + p.w > plat.x &&
          p.x < plat.x + plat.w &&
          p.y + p.h >= plat.y &&
          p.y + p.h - p.vy <= plat.y + 12 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.isGrounded = true;
          break;
        }
      }

      // Check nearby interactive objects
      let foundTomb: Tomb | null = null;
      for (const t of tombs) {
        const dist = Math.hypot(p.x + p.w / 2 - (t.x + 22), p.y + p.h / 2 - (t.y + 14));
        if (dist < 60) {
          foundTomb = t;
          break;
        }
      }
      setNearbyTomb(foundTomb);

      const distAltar = Math.hypot(p.x + p.w / 2 - (altarX + 30), p.y + p.h / 2 - 365);
      setNearAltar(distAltar < 65);

      if (keys.interact) {
        keys.interact = false;
        if (foundTomb) {
          sounds.playInspect();
          onSelectTomb(foundTomb);
        } else if (distAltar < 65) {
          sounds.playInspect();
          onOpenBuryModal();
        }
      }

      // Camera follow
      const canvasW = canvas.width;
      const targetCamX = p.x - canvasW / 2 + p.w / 2;
      const minCamX = 0;
      const maxCamX = Math.max(0, worldWidth - canvasW);
      cameraXRef.current += (Math.max(minCamX, Math.min(maxCamX, targetCamX)) - cameraXRef.current) * 0.1;
      const camX = cameraXRef.current;

      // ---------------- RENDER ----------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-camX, 0);

      // Gothic stone wall background
      ctx.fillStyle = '#080510';
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      // Soft stone masonry grid
      ctx.strokeStyle = 'rgba(28, 22, 45, 0.6)';
      ctx.lineWidth = 1;
      for (let y = 0; y < worldHeight; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(worldWidth, y);
        ctx.stroke();
      }
      for (let x = 0; x < worldWidth; x += 72) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldHeight);
        ctx.stroke();
      }

      // Draw Wall Torches & Glowing Embers
      torches.forEach((torch, i) => {
        // Sconce
        ctx.fillStyle = '#3a2c1d';
        ctx.fillRect(torch.x - 3, torch.y, 6, 16);
        ctx.fillStyle = '#5c452e';
        ctx.fillRect(torch.x - 5, torch.y - 2, 10, 4);

        // Animated Flame with soft glow
        const flicker = Math.sin(frameCount * 0.14 + i * 2) * 2;
        const color = i % 2 === 0 ? '#f59e0b' : '#c084fc';
        const inner = i % 2 === 0 ? '#fef08a' : '#f3e8ff';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(torch.x, torch.y - 8 + flicker, 7, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = inner;
        ctx.beginPath();
        ctx.ellipse(torch.x, torch.y - 7 + flicker, 3.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Platforms & Procedural Stairs
      platforms.forEach(plat => {
        // Platform main block
        ctx.fillStyle = plat.isStair ? '#1e182f' : '#181226';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        // Stone border
        ctx.strokeStyle = plat.isStair ? '#3e3258' : '#332746';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

        // Top stone highlight
        ctx.fillStyle = plat.isStair ? '#2e2544' : '#281f38';
        ctx.fillRect(plat.x, plat.y, plat.w, 3);
      });

      // Draw Tombs & Sarcophagi
      tombs.forEach(t => {
        const isPlundered = t.status === 'plundered';

        // Sarcophagus stone box
        ctx.fillStyle = isPlundered ? '#15121b' : '#231b35';
        ctx.fillRect(t.x, t.y, 44, 28);
        ctx.strokeStyle = isPlundered ? '#3a3248' : '#9333ea';
        ctx.lineWidth = isPlundered ? 1 : 2;
        ctx.strokeRect(t.x, t.y, 44, 28);

        // Carved arched tombstone
        ctx.beginPath();
        ctx.arc(t.x + 22, t.y, 14, Math.PI, 0, false);
        ctx.fillStyle = isPlundered ? '#1c1724' : '#31234b';
        ctx.fill();
        ctx.strokeStyle = isPlundered ? '#3a3248' : '#c084fc';
        ctx.stroke();

        // Icon
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isPlundered ? '🦴' : '🪦', t.x + 22, t.y + 18);

        // Floating Reward Tag
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = isPlundered ? '#71717a' : '#34d399';
        ctx.fillText(isPlundered ? 'LOOTED' : `${t.bountyXTR} XTR`, t.x + 22, t.y - 18);

        // Pulsing ethereal aura for sealed crypts
        if (!isPlundered) {
          const aura = 0.25 + Math.sin(frameCount * 0.08 + t.x) * 0.15;
          ctx.strokeStyle = `rgba(168, 85, 247, ${aura})`;
          ctx.lineWidth = 3;
          ctx.strokeRect(t.x - 2, t.y - 2, 48, 32);
        }
      });

      // Draw Burial Altar
      ctx.fillStyle = '#26143d';
      ctx.fillRect(altarX, 350, 60, 50);
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2;
      ctx.strokeRect(altarX, 350, 60, 50);

      ctx.font = '14px serif';
      ctx.fillStyle = '#f0abfc';
      ctx.textAlign = 'center';
      ctx.fillText('⚰️', altarX + 30, 375);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('DIG GRAVE', altarX + 30, 335);

      // Draw Player (Grave Robber with Lantern)
      ctx.save();
      ctx.translate(p.x, p.y);

      // Cloak
      ctx.fillStyle = '#341555';
      ctx.fillRect(4, 10, p.w - 8, p.h - 10);

      // Hood
      ctx.fillStyle = '#1c0a32';
      ctx.beginPath();
      ctx.arc(p.w / 2, 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Eyes
      ctx.fillStyle = '#22d3ee';
      if (p.facingRight) {
        ctx.fillRect(p.w / 2 + 1, 6, 2, 2);
        ctx.fillRect(p.w / 2 + 5, 6, 2, 2);
      } else {
        ctx.fillRect(p.w / 2 - 3, 6, 2, 2);
        ctx.fillRect(p.w / 2 - 7, 6, 2, 2);
      }

      // Golden Lantern
      const lanternX = p.facingRight ? p.w + 2 : -6;
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(lanternX, 16, 5, 8);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lanternX + 2.5, 20, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Dynamic Ambient Light Mask (Radial Lantern Cutout)
      ctx.restore(); // Exit camera coordinate space

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        // Deep ambient darkness
        tCtx.fillStyle = 'rgba(5, 3, 9, 0.88)';
        tCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Punch out light circles
        tCtx.globalCompositeOperation = 'destination-out';

        // Player Lantern Light
        const screenPx = p.x - camX + (p.facingRight ? p.w + 4 : -4);
        const screenPy = p.y + 20;
        const lanternRadius = 165 + Math.sin(frameCount * 0.08) * 8;

        const radGrad = tCtx.createRadialGradient(screenPx, screenPy, 15, screenPx, screenPy, lanternRadius);
        radGrad.addColorStop(0, 'rgba(0,0,0,1)');
        radGrad.addColorStop(0.55, 'rgba(0,0,0,0.7)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        tCtx.fillStyle = radGrad;
        tCtx.beginPath();
        tCtx.arc(screenPx, screenPy, lanternRadius, 0, Math.PI * 2);
        tCtx.fill();

        // Wall Torch light holes
        torches.forEach((torch, i) => {
          const sTx = torch.x - camX;
          const sTy = torch.y - 4;
          if (sTx > -60 && sTx < canvas.width + 60) {
            const torchRadius = 80 + Math.sin(frameCount * 0.12 + i) * 5;
            const tGrad = tCtx.createRadialGradient(sTx, sTy, 4, sTx, sTy, torchRadius);
            tGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
            tGrad.addColorStop(1, 'rgba(0,0,0,0)');
            tCtx.fillStyle = tGrad;
            tCtx.beginPath();
            tCtx.arc(sTx, sTy, torchRadius, 0, Math.PI * 2);
            tCtx.fill();
          }
        });

        ctx.drawImage(tempCanvas, 0, 0);
      }

      // HUD Prompt Overlay
      if (foundTomb) {
        ctx.fillStyle = 'rgba(18, 14, 28, 0.94)';
        ctx.strokeStyle = '#9333ea';
        ctx.lineWidth = 1.5;
        const pillW = 250;
        const pillX = canvas.width / 2 - pillW / 2;
        ctx.beginPath();
        ctx.roundRect(pillX, 20, pillW, 44, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#f3e8ff';
        ctx.textAlign = 'center';
        ctx.fillText(`PRESS [E] TO INSPECT`, canvas.width / 2, 38);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`Bounty: ${foundTomb.bountyXTR} XTR (${foundTomb.status})`, canvas.width / 2, 54);
      } else if (distAltar < 65) {
        ctx.fillStyle = 'rgba(28, 14, 38, 0.94)';
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1.5;
        const pillW = 260;
        const pillX = canvas.width / 2 - pillW / 2;
        ctx.beginPath();
        ctx.roundRect(pillX, 20, pillW, 44, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#fdf4ff';
        ctx.textAlign = 'center';
        ctx.fillText(`PRESS [E] TO BURY LOOT`, canvas.width / 2, 38);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#f472b6';
        ctx.fillText('Seal your own riddle in the crypt', canvas.width / 2, 54);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [tombs, platforms, onSelectTomb, onOpenBuryModal]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-purple-900/50 shadow-[0_0_35px_rgba(147,51,234,0.18)] bg-stone-950">
      {/* Canvas container */}
      <div className="w-full aspect-[2/1] max-h-[520px] bg-stone-950 flex justify-center items-center relative">
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Floating Quick Action Button */}
        {nearbyTomb && (
          <button
            onClick={() => onSelectTomb(nearbyTomb)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-pixel text-xs rounded-2xl shadow-xl border border-purple-300 flex items-center gap-2 animate-bounce cursor-pointer z-10"
          >
            <Key className="w-4 h-4 text-amber-300" />
            Inspect {nearbyTomb.name.slice(0, 18)}... [E]
          </button>
        )}

        {nearAltar && !nearbyTomb && (
          <button
            onClick={onOpenBuryModal}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-fuchsia-800 hover:bg-fuchsia-700 text-white font-pixel text-xs rounded-2xl shadow-xl border border-fuchsia-300 flex items-center gap-2 animate-bounce cursor-pointer z-10"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Bury New Treasure [E]
          </button>
        )}
      </div>

      {/* Control bar */}
      <div className="bg-stone-950 border-t border-purple-950/60 p-3.5 flex flex-wrap justify-between items-center text-xs text-stone-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-purple-300">
            <Compass className="w-4 h-4" /> Move: <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200">A</kbd> <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200">D</kbd> or <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200">←</kbd> <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200">→</kbd>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            Jump: <kbd className="px-2 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200">W</kbd>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            Action: <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200">E</kbd>
          </span>
        </div>

        {/* Touch buttons */}
        <div className="flex gap-2 sm:hidden mt-2 w-full justify-center">
          <button
            onMouseDown={() => { keysRef.current.left = true; }}
            onMouseUp={() => { keysRef.current.left = false; }}
            onTouchStart={() => { keysRef.current.left = true; }}
            onTouchEnd={() => { keysRef.current.left = false; }}
            className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl active:bg-stone-800 text-stone-200"
          >
            ◀
          </button>
          <button
            onMouseDown={() => { keysRef.current.right = true; }}
            onMouseUp={() => { keysRef.current.right = false; }}
            onTouchStart={() => { keysRef.current.right = true; }}
            onTouchEnd={() => { keysRef.current.right = false; }}
            className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl active:bg-stone-800 text-stone-200"
          >
            ▶
          </button>
          <button
            onClick={() => {
              if (playerRef.current.isGrounded) {
                playerRef.current.vy = -11.8;
                playerRef.current.isGrounded = false;
                sounds.playJump();
              }
            }}
            className="px-4 py-2 bg-purple-900 border border-purple-700 rounded-xl active:bg-purple-800 text-purple-200 font-pixel text-[10px]"
          >
            JUMP
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-stone-500">
          <span>Staircases procedural &bull; Climb each set of steps to reach sarcophagi</span>
        </div>
      </div>
    </div>
  );
};
