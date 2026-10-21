import React, { useEffect, useRef, useState } from 'react';
import type { Tomb } from '../types/tari';
import { sounds } from '../services/soundEffects';
import { Sparkles, Key, Compass } from 'lucide-react';

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
}

export const CryptPlatformer: React.FC<CryptPlatformerProps> = ({
  tombs,
  onSelectTomb,
  onOpenBuryModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Near target detection
  const [nearbyTomb, setNearbyTomb] = useState<Tomb | null>(null);
  const [nearAltar, setNearAltar] = useState<boolean>(false);

  // Player physics state
  const playerRef = useRef({
    x: 80,
    y: 320,
    vx: 0,
    vy: 0,
    w: 24,
    h: 36,
    isGrounded: false,
    facingRight: true,
  });

  // World dimensions
  const worldWidth = 1850;
  const worldHeight = 460;
  const altarX = 1700;

  // Platforms layout
  const platforms: Platform[] = [
    // Ground floor
    { x: 0, y: 400, w: 1850, h: 60 },
    // Platform 1 (Screaming Crypt)
    { x: 220, y: 320, w: 150, h: 16 },
    // Platform 2 (Mid tier)
    { x: 440, y: 260, w: 130, h: 16 },
    // Platform 3 (Vampire Crypt)
    { x: 600, y: 200, w: 160, h: 16 },
    // Platform 4 (High jump bridge)
    { x: 830, y: 160, w: 140, h: 16 },
    // Platform 5 (Lich Sanctum top)
    { x: 1000, y: 110, w: 180, h: 16 },
    // Platform 6 (Descent)
    { x: 1240, y: 220, w: 130, h: 16 },
    // Platform 7 (Drowned Hollow)
    { x: 1370, y: 320, w: 150, h: 16 },
    // Altar dais
    { x: 1640, y: 360, w: 180, h: 40 },
  ];

  // Wall torches
  const torches = [
    { x: 120, y: 250 },
    { x: 300, y: 180 },
    { x: 500, y: 140 },
    { x: 700, y: 90 },
    { x: 920, y: 80 },
    { x: 1120, y: 160 },
    { x: 1320, y: 240 },
    { x: 1550, y: 260 },
    { x: 1750, y: 220 },
  ];

  // Key tracking
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; interact: boolean }>({
    left: false,
    right: false,
    up: false,
    interact: false,
  });

  // Camera scroll offset
  const cameraXRef = useRef(0);

  // Setup input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrows / space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        if (playerRef.current.isGrounded) {
          keysRef.current.up = true;
          playerRef.current.vy = -11.5;
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

  // Main game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const loop = () => {
      frameCount++;
      const p = playerRef.current;
      const keys = keysRef.current;

      // 1. Horizontal movement
      const speed = 3.6;
      if (keys.left) {
        p.vx = -speed;
        p.facingRight = false;
      } else if (keys.right) {
        p.vx = speed;
        p.facingRight = true;
      } else {
        p.vx *= 0.78; // friction
      }

      // 2. Vertical movement & gravity
      p.vy += 0.55; // gravity
      if (p.vy > 12) p.vy = 12;

      // Apply horizontal
      p.x += p.vx;
      if (p.x < 10) p.x = 10;
      if (p.x > worldWidth - p.w - 10) p.x = worldWidth - p.w - 10;

      // Apply vertical
      p.y += p.vy;

      // 3. Platform collisions (box check)
      p.isGrounded = false;
      for (const plat of platforms) {
        // Landing on top of platform
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

      // Check nearby objects
      let foundTomb: Tomb | null = null;
      for (const t of tombs) {
        const dist = Math.hypot(p.x + p.w / 2 - (t.x + 20), p.y + p.h / 2 - (t.y + 15));
        if (dist < 55) {
          foundTomb = t;
          break;
        }
      }
      setNearbyTomb(foundTomb);

      const distAltar = Math.hypot(p.x + p.w / 2 - (altarX + 30), p.y + p.h / 2 - 370);
      setNearAltar(distAltar < 65);

      // Handle interaction key trigger
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

      // 4. Update Camera viewport
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

      // Background Stone Wall
      ctx.fillStyle = '#0a0812';
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      // Draw faint brick texture
      ctx.strokeStyle = '#151124';
      ctx.lineWidth = 1;
      for (let y = 0; y < worldHeight; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(worldWidth, y);
        ctx.stroke();
      }
      for (let x = 0; x < worldWidth; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldHeight);
        ctx.stroke();
      }

      // Draw Wall Torches & Flames
      torches.forEach((torch, i) => {
        // Torch mount
        ctx.fillStyle = '#4c3928';
        ctx.fillRect(torch.x - 3, torch.y, 6, 16);
        ctx.fillStyle = '#785b3f';
        ctx.fillRect(torch.x - 5, torch.y - 2, 10, 4);

        // Animated torch flame
        const flameOffset = Math.sin(frameCount * 0.15 + i) * 2;
        const flameColor = i % 2 === 0 ? '#f59e0b' : '#c084fc';
        const innerColor = i % 2 === 0 ? '#fef08a' : '#f3e8ff';

        ctx.fillStyle = flameColor;
        ctx.beginPath();
        ctx.ellipse(torch.x, torch.y - 8 + flameOffset, 7, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = innerColor;
        ctx.beginPath();
        ctx.ellipse(torch.x, torch.y - 7 + flameOffset, 3.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Platforms
      platforms.forEach(plat => {
        // Platform body
        ctx.fillStyle = '#1c172a';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        // Stone border
        ctx.strokeStyle = '#382f50';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

        // Platform top moss / mossy crypt rim
        ctx.fillStyle = '#2e2544';
        ctx.fillRect(plat.x, plat.y, plat.w, 4);
      });

      // Draw Tombs & Sarcophagi
      tombs.forEach(t => {
        const isPlundered = t.status === 'plundered';

        // Sarcophagus base
        ctx.fillStyle = isPlundered ? '#18151f' : '#27203b';
        ctx.fillRect(t.x, t.y, 44, 28);
        ctx.strokeStyle = isPlundered ? '#403852' : '#a855f7';
        ctx.lineWidth = isPlundered ? 1 : 2;
        ctx.strokeRect(t.x, t.y, 44, 28);

        // Tomb lid / Headstone
        ctx.beginPath();
        ctx.arc(t.x + 22, t.y, 14, Math.PI, 0, false);
        ctx.fillStyle = isPlundered ? '#221c2c' : '#372b54';
        ctx.fill();
        ctx.strokeStyle = isPlundered ? '#403852' : '#c084fc';
        ctx.stroke();

        // Cross or skull emblem
        ctx.fillStyle = isPlundered ? '#493f5e' : '#e9d5ff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isPlundered ? '🦴' : '🪦', t.x + 22, t.y + 18);

        // Floating label
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = isPlundered ? '#71717a' : '#34d399';
        ctx.fillText(isPlundered ? 'LOOTED' : `${t.bountyXTR} XTR`, t.x + 22, t.y - 18);

        // Spooky glow pulse around sealed tomb
        if (!isPlundered) {
          const glowAlpha = 0.2 + Math.sin(frameCount * 0.08 + t.x) * 0.12;
          ctx.strokeStyle = `rgba(168, 85, 247, ${glowAlpha})`;
          ctx.lineWidth = 4;
          ctx.strokeRect(t.x - 2, t.y - 2, 48, 32);
        }
      });

      // Draw Ancient Burial Altar (where players bury their own loot)
      ctx.fillStyle = '#2a1a44';
      ctx.fillRect(altarX, 350, 60, 50);
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 2;
      ctx.strokeRect(altarX, 350, 60, 50);

      // Altar mystical runes
      ctx.font = '12px serif';
      ctx.fillStyle = '#f0abfc';
      ctx.textAlign = 'center';
      ctx.fillText('⚰️', altarX + 30, 375);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('DIG GRAVE', altarX + 30, 335);

      // Draw Player (Grave Robber with Lantern)
      ctx.save();
      ctx.translate(p.x, p.y);

      // Cloak
      ctx.fillStyle = '#3b1d60';
      ctx.fillRect(4, 10, p.w - 8, p.h - 10);

      // Hood / Head
      ctx.fillStyle = '#220e3a';
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

      // Lantern in hand
      const lanternX = p.facingRight ? p.w + 2 : -6;
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(lanternX, 16, 5, 8);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lanternX + 2.5, 20, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 5. Atmospheric Darkness & Lantern Lighting Mask
      ctx.restore(); // Exit camera coordinate space for global light mask

      // Create a full-screen dark overlay with cutouts
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        // Base ambient darkness
        tCtx.fillStyle = 'rgba(4, 3, 8, 0.88)';
        tCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Destination-out punch holes for lantern light
        tCtx.globalCompositeOperation = 'destination-out';

        // Player Lantern Light
        const screenPx = p.x - camX + (p.facingRight ? p.w + 4 : -4);
        const screenPy = p.y + 20;
        const lanternRadius = 150 + Math.sin(frameCount * 0.1) * 6;

        const radGrad = tCtx.createRadialGradient(screenPx, screenPy, 10, screenPx, screenPy, lanternRadius);
        radGrad.addColorStop(0, 'rgba(0,0,0,1)');
        radGrad.addColorStop(0.5, 'rgba(0,0,0,0.7)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        tCtx.fillStyle = radGrad;
        tCtx.beginPath();
        tCtx.arc(screenPx, screenPy, lanternRadius, 0, Math.PI * 2);
        tCtx.fill();

        // Torch light holes
        torches.forEach((torch, i) => {
          const sTx = torch.x - camX;
          const sTy = torch.y - 4;
          if (sTx > -50 && sTx < canvas.width + 50) {
            const torchRadius = 75 + Math.sin(frameCount * 0.12 + i) * 4;
            const tGrad = tCtx.createRadialGradient(sTx, sTy, 4, sTx, sTy, torchRadius);
            tGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
            tGrad.addColorStop(1, 'rgba(0,0,0,0)');
            tCtx.fillStyle = tGrad;
            tCtx.beginPath();
            tCtx.arc(sTx, sTy, torchRadius, 0, Math.PI * 2);
            tCtx.fill();
          }
        });

        // Draw light mask onto main canvas
        ctx.drawImage(tempCanvas, 0, 0);
      }

      // 6. Draw HUD overlays (Distance, Key prompts)
      if (foundTomb) {
        ctx.fillStyle = 'rgba(15, 12, 25, 0.9)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        const pillW = 240;
        const pillX = canvas.width / 2 - pillW / 2;
        ctx.fillRect(pillX, 24, pillW, 40);
        ctx.strokeRect(pillX, 24, pillW, 40);

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#f3e8ff';
        ctx.textAlign = 'center';
        ctx.fillText(`PRESS [E] TO INSPECT`, canvas.width / 2, 42);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`Reward: ${foundTomb.bountyXTR} XTR (${foundTomb.status})`, canvas.width / 2, 57);
      } else if (distAltar < 65) {
        ctx.fillStyle = 'rgba(25, 12, 35, 0.9)';
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 2;
        const pillW = 260;
        const pillX = canvas.width / 2 - pillW / 2;
        ctx.fillRect(pillX, 24, pillW, 40);
        ctx.strokeRect(pillX, 24, pillW, 40);

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#fdf4ff';
        ctx.textAlign = 'center';
        ctx.fillText(`PRESS [E] TO BURY LOOT`, canvas.width / 2, 42);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#f472b6';
        ctx.fillText('Seal your own riddle in the crypt', canvas.width / 2, 57);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [tombs, onSelectTomb, onOpenBuryModal]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-purple-900/60 shadow-2xl bg-black">
      {/* Canvas container */}
      <div className="w-full aspect-[2/1] max-h-[520px] bg-stone-950 flex justify-center items-center relative">
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Floating Quick Action Button when near an interactive object */}
        {nearbyTomb && (
          <button
            onClick={() => onSelectTomb(nearbyTomb)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-pixel text-xs rounded-xl shadow-lg border border-purple-300 flex items-center gap-2 animate-bounce cursor-pointer z-10"
          >
            <Key className="w-4 h-4 text-amber-300" />
            Inspect {nearbyTomb.name.slice(0, 20)}... [E]
          </button>
        )}

        {nearAltar && !nearbyTomb && (
          <button
            onClick={onOpenBuryModal}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-fuchsia-800 hover:bg-fuchsia-700 text-white font-pixel text-xs rounded-xl shadow-lg border border-fuchsia-300 flex items-center gap-2 animate-bounce cursor-pointer z-10"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Bury New Treasure [E]
          </button>
        )}
      </div>

      {/* Retro Gamepad / Touch Controls bar for mobile or easy play */}
      <div className="bg-stone-900/90 border-t border-purple-900/40 p-3 flex flex-wrap justify-between items-center text-xs text-stone-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-purple-300">
            <Compass className="w-4 h-4" /> Move: <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-200">A</kbd> <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-200">D</kbd> or <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-200">←</kbd> <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-200">→</kbd>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            Jump: <kbd className="px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-200">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-200">W</kbd>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            Action: <kbd className="px-1.5 py-0.5 bg-stone-800 border border-stone-700 rounded text-stone-200">E</kbd>
          </span>
        </div>

        {/* On-screen touch buttons */}
        <div className="flex gap-2 sm:hidden mt-2 w-full justify-center">
          <button
            onMouseDown={() => { keysRef.current.left = true; }}
            onMouseUp={() => { keysRef.current.left = false; }}
            onTouchStart={() => { keysRef.current.left = true; }}
            onTouchEnd={() => { keysRef.current.left = false; }}
            className="px-4 py-2 bg-stone-800 border border-stone-700 rounded active:bg-stone-700"
          >
            ◀
          </button>
          <button
            onMouseDown={() => { keysRef.current.right = true; }}
            onMouseUp={() => { keysRef.current.right = false; }}
            onTouchStart={() => { keysRef.current.right = true; }}
            onTouchEnd={() => { keysRef.current.right = false; }}
            className="px-4 py-2 bg-stone-800 border border-stone-700 rounded active:bg-stone-700"
          >
            ▶
          </button>
          <button
            onClick={() => {
              if (playerRef.current.isGrounded) {
                playerRef.current.vy = -11.5;
                playerRef.current.isGrounded = false;
                sounds.playJump();
              }
            }}
            className="px-4 py-2 bg-purple-900 border border-purple-600 rounded active:bg-purple-700 text-purple-200 font-pixel text-[10px]"
          >
            JUMP
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-stone-500">
          <span>Explore all 4 tombs or visit the Altar at the far right</span>
        </div>
      </div>
    </div>
  );
};
