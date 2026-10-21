import React, { useState } from 'react';
import type { Tomb } from '../types/tari';
import { hashAnswer, TariWalletService } from '../services/tariWallet';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { X, Sparkles, AlertCircle, Lock } from 'lucide-react';

interface BuryTombModalProps {
  userAddress: string;
  isSimulator: boolean;
  onClose: () => void;
  onBurySuccess: (newTomb: Tomb) => void;
}

export const BuryTombModal: React.FC<BuryTombModalProps> = ({
  userAddress,
  isSimulator,
  onClose,
  onBurySuccess,
}) => {
  const [name, setName] = useState('');
  const [epitaph, setEpitaph] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [bountyXTR, setBountyXTR] = useState(100);
  const [difficulty, setDifficulty] = useState<'Apprentice' | 'Necromancer' | 'Arch-Lich'>('Necromancer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !epitaph.trim() || !secretAnswer.trim()) {
      setError('Please fill out the crypt name, riddle, and secret answer.');
      sounds.playError();
      return;
    }

    if (bountyXTR <= 0) {
      setError('Bounty must be at least 1 XTR.');
      sounds.playError();
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Hash the secret answer
      const answerHash = await hashAnswer(secretAnswer);

      // 2. Lock on Tari
      if (!isSimulator && TariWalletService.isAvailable() && userAddress) {
        await TariWalletService.buryBounty({
          title: name,
          bountyXTR,
          answerHash,
        });
      } else {
        await new Promise(r => setTimeout(r, 700));
      }

      // 3. Create the new tomb
      const newTomb: Tomb = {
        id: 'tomb-' + Date.now(),
        name,
        epitaph,
        hint: hint || 'No hint carved on this stone.',
        creator: userAddress || 'otl_esm_1shadow_necromancer',
        bountyXTR,
        answerHash,
        status: 'sealed',
        difficulty,
        x: 400 + Math.floor(Math.random() * 800),
        y: 260,
      };

      sounds.playPlunder();
      confetti({
        particleCount: 50,
        spread: 60,
        colors: ['#c084fc', '#f472b6', '#fbbf24'],
      });

      onBurySuccess(newTomb);
      onClose();
    } catch (err: any) {
      sounds.playError();
      setError(err.message || 'Failed to seal tomb on Tari.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-fuchsia-800/80 rounded-2xl shadow-[0_0_50px_rgba(232,121,249,0.25)] overflow-hidden text-stone-200">
        {/* Header */}
        <div className="bg-stone-950/80 border-b border-fuchsia-900/40 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚰️</span>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-fuchsia-200">
                Dig & Inscribe a Secret Tomb
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Lock Tari XTR with a confidential hash riddle
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-stone-300 mb-1">
              Tomb Name / Crypt Title
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Crypt of the Cursed Pharaoh"
              className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-fuchsia-500 font-mono text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-300 mb-1">
              Carved Riddle (The Epitaph)
            </label>
            <textarea
              rows={2}
              value={epitaph}
              onChange={e => setEpitaph(e.target.value)}
              placeholder="e.g. What disappears the moment you say its name?"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-fuchsia-500 font-mono text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-stone-300 mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-fuchsia-400" /> Secret Answer
              </label>
              <input
                type="text"
                value={secretAnswer}
                onChange={e => setSecretAnswer(e.target.value)}
                placeholder="e.g. silence"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-fuchsia-500 font-mono text-xs"
                required
              />
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Hashed with SHA-256 client-side
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-300 mb-1">
                Bounty Amount (XTR)
              </label>
              <input
                type="number"
                min={1}
                value={bountyXTR}
                onChange={e => setBountyXTR(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-fuchsia-500 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-stone-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-fuchsia-500 font-mono text-xs"
              >
                <option value="Apprentice">Apprentice (Easy)</option>
                <option value="Necromancer">Necromancer (Medium)</option>
                <option value="Arch-Lich">Arch-Lich (Hard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-stone-300 mb-1">
                Optional Hint
              </label>
              <input
                type="text"
                value={hint}
                onChange={e => setHint(e.target.value)}
                placeholder="e.g. Sounds break it..."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-fuchsia-500 font-mono text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-gradient-to-r from-fuchsia-700 to-purple-800 hover:from-fuchsia-600 hover:to-purple-700 text-white font-pixel text-xs rounded-xl shadow-lg border border-fuchsia-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-fuchsia-300" />
                Sealing on Tari Ootle...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                SEAL TOMB & DEPOSIT BOUNTY
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
