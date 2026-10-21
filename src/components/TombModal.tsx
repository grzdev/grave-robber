import React, { useState } from 'react';
import type { Tomb } from '../types/tari';
import { hashAnswer, TariWalletService } from '../services/tariWallet';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  KeyRound,
  Skull,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Unlock,
  CheckCircle2,
} from 'lucide-react';

interface TombModalProps {
  tomb: Tomb | null;
  userAddress: string;
  isSimulator: boolean;
  onClose: () => void;
  onPlunderSuccess: (tombId: string, robberAddress: string, txHash: string) => void;
  onConnectWallet: () => void;
}

/**
 * Custom Spooky Confetti Fanfare with custom shapes (coins, skulls, embers)
 */
function launchSpookyVictoryConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Dual cannons from bottom left & right
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.8 },
    colors: ['#a855f7', '#fbbf24', '#34d399', '#f43f5e'],
    zIndex: 9999,
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.8 },
    colors: ['#a855f7', '#fbbf24', '#34d399', '#f43f5e'],
    zIndex: 9999,
  });

  // Center sparkling burst
  fire(0.3, {
    spread: 70,
    startVelocity: 45,
    colors: ['#fbbf24', '#f59e0b', '#fef08a'],
    scalar: 1.2,
  });
  fire(0.25, {
    spread: 100,
    decay: 0.91,
    scalar: 0.9,
    colors: ['#a855f7', '#c084fc', '#e879f9'],
  });
  fire(0.2, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#34d399', '#10b981', '#6ee7b7'],
  });
}

export const TombModal: React.FC<TombModalProps> = ({
  tomb,
  userAddress,
  isSimulator,
  onClose,
  onPlunderSuccess,
  onConnectWallet,
}) => {
  const [solutionInput, setSolutionInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Victory celebration state
  const [victoryData, setVictoryData] = useState<{
    txHash: string;
    bounty: number;
    receiver: string;
  } | null>(null);

  if (!tomb) return null;

  const isPlundered = tomb.status === 'plundered';

  const handleAttemptPlunder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!solutionInput.trim()) {
      setErrorMessage('You must speak a solution to break the seal.');
      sounds.playError();
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Compute SHA-256 hash of answer
      const inputHash = await hashAnswer(solutionInput);

      if (inputHash !== tomb.answerHash) {
        sounds.playError();
        setErrorMessage('The ancient seal rejects your words! The riddle remains unbroken.');
        setIsSubmitting(false);
        return;
      }

      // 2. Hash matches! Proceed to claim stealth bounty
      let txHash = 'tx_esm_' + Math.random().toString(36).substring(2, 12);
      const recipient = userAddress || 'otl_esm_1shadow_grave_robber';

      if (!isSimulator && TariWalletService.isAvailable() && userAddress) {
        const claimResult = await TariWalletService.claimBounty({
          tombId: tomb.id,
          bountyXTR: tomb.bountyXTR,
          claimantAddress: recipient,
          preimageSolution: solutionInput,
        });
        txHash = claimResult.txHash;
      } else {
        await new Promise(res => setTimeout(res, 900));
        txHash = 'tx_esmeralda_ootle_' + Math.random().toString(16).substring(2, 12);
      }

      // 3. Victory audio & visual fanfare
      sounds.playPlunder();
      launchSpookyVictoryConfetti();

      // Show victory screen
      setVictoryData({
        txHash,
        bounty: tomb.bountyXTR,
        receiver: recipient,
      });

      onPlunderSuccess(tomb.id, recipient, txHash);
      setIsSubmitting(false);
    } catch (err: any) {
      sounds.playError();
      setErrorMessage(err.message || 'The crypt rejected your claim.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border-2 border-purple-800 rounded-3xl shadow-[0_0_60px_rgba(147,51,234,0.25)] overflow-hidden text-stone-200">
        {/* Top Header */}
        <div className="bg-stone-950/90 border-b border-purple-950 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{isPlundered || victoryData ? '🔓' : '🪦'}</span>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-purple-200 leading-tight">
                {tomb.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-0.5">
                <span>By: {tomb.creator.slice(0, 16)}...</span>
                <span>•</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                    tomb.difficulty === 'Arch-Lich'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : tomb.difficulty === 'Necromancer'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {tomb.difficulty}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* If Victory Just Happened, Render the Grand Reveal Card! */}
          {victoryData ? (
            <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-amber-500 to-emerald-500 blur-xl opacity-60 animate-pulse"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-stone-950 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-2xl">
                  ⚱️
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-pixel text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  CURSE LIFTED • BOUNTY PLUNDERED!
                </div>
                <h4 className="font-cinzel text-2xl font-black text-amber-300">
                  +{victoryData.bounty} XTR Added
                </h4>
                <p className="text-xs text-stone-400 font-mono">
                  Transferred confidentially to your stealth wallet
                </p>
              </div>

              {/* Cryptographic Transaction Receipt */}
              <div className="p-4 bg-stone-950 border border-purple-900/50 rounded-2xl text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-stone-400">
                  <span>Network:</span>
                  <span className="text-purple-300">Tari Ootle (Esmeralda)</span>
                </div>
                <div className="flex justify-between items-center text-stone-400">
                  <span>Stealth Receiver:</span>
                  <span className="text-emerald-400 font-bold">
                    {victoryData.receiver.slice(0, 14)}...
                  </span>
                </div>
                <div className="flex justify-between items-center text-stone-400">
                  <span>Tx Hash:</span>
                  <code className="text-[11px] text-amber-300 bg-stone-900 px-1.5 py-0.5 rounded">
                    {victoryData.txHash}
                  </code>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-pixel text-xs rounded-xl shadow-lg border border-purple-400/30 cursor-pointer"
              >
                Continue Exploring Catacombs
              </button>
            </div>
          ) : (
            /* Normal Inspection View */
            <>
              {/* Bounty Reward Card */}
              <div className="flex justify-between items-center p-4 bg-stone-950 border border-purple-900/40 rounded-2xl">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">
                    Treasure Inside
                  </span>
                  <span className="text-2xl font-bold font-pixel text-emerald-400">
                    {tomb.bountyXTR} <span className="text-sm font-sans text-stone-400">XTR</span>
                  </span>
                </div>
                <div className="text-right text-xs font-mono text-stone-400">
                  <span className="flex items-center justify-end gap-1 text-purple-300">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Tari Stealth Sealed
                  </span>
                  <span className="text-[10px] text-stone-500">Unlinkable Payout Mechanism</span>
                </div>
              </div>

              {/* Inscription Epitaph */}
              <div className="relative p-5 bg-stone-950/90 border border-stone-800 rounded-2xl shadow-inner">
                <div className="absolute -top-3 left-4 px-2.5 bg-stone-900 text-[10px] font-mono text-stone-400 uppercase tracking-wider border border-stone-700 rounded-md">
                  Ancient Inscription
                </div>
                <p className="font-serif italic text-base text-stone-200 leading-relaxed text-center py-2">
                  "{tomb.epitaph}"
                </p>
              </div>

              {/* Plundered status or Solve Form */}
              {isPlundered ? (
                <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-stone-400 font-pixel text-xs">
                    <Skull className="w-4 h-4 text-stone-500" />
                    <span>THIS TOMB HAS BEEN PLUNDERED</span>
                  </div>
                  <p className="text-xs text-stone-400 font-mono">
                    Looted by: <span className="text-purple-300">{tomb.plunderedBy}</span>
                  </p>
                  {tomb.txHash && (
                    <p className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                      Tx: {tomb.txHash} <ExternalLink className="w-3 h-3 text-stone-400 inline" />
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleAttemptPlunder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-stone-300 mb-1.5 flex justify-between">
                      <span>Speak the Secret Word (Riddle Solution)</span>
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : 'Whisper Hint'}
                      </button>
                    </label>

                    {showHint && (
                      <div className="mb-2 p-3 bg-purple-950/40 border border-purple-900/50 rounded-xl text-xs text-purple-200 italic font-serif">
                        🦇 {tomb.hint}
                      </div>
                    )}

                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                      <input
                        type="text"
                        value={solutionInput}
                        onChange={e => setSolutionInput(e.target.value)}
                        placeholder="Enter the secret word..."
                        className="w-full pl-10 pr-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-purple-500 font-mono text-sm"
                        autoFocus
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {!userAddress && !isSimulator && (
                    <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl flex items-center justify-between text-xs text-amber-200">
                      <span>Connect Sapient to receive the bounty directly.</span>
                      <button
                        type="button"
                        onClick={onConnectWallet}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs"
                      >
                        Connect
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-white font-pixel text-xs rounded-xl shadow-lg border border-purple-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-purple-300" />
                        Unlocking Crypt on Tari...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 text-amber-300" />
                        BREAK SEAL & CLAIM BOUNTY
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Educational Footer */}
              <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-500 font-mono flex items-center justify-between">
                <span>Preimage Hash Verification</span>
                <span>Stealth Address Payout</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
