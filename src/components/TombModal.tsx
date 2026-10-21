import React, { useState } from 'react';
import type { Tomb } from '../types/tari';
import { hashAnswer, TariWalletService } from '../services/tariWallet';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, KeyRound, Skull, Sparkles, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';

interface TombModalProps {
  tomb: Tomb | null;
  userAddress: string;
  isSimulator: boolean;
  onClose: () => void;
  onPlunderSuccess: (tombId: string, robberAddress: string, txHash: string) => void;
  onConnectWallet: () => void;
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
        setErrorMessage('The curse resists your answer! The riddle remains unbroken.');
        setIsSubmitting(false);
        return;
      }

      // 2. Hash matches! Proceed to claim stealth bounty
      let txHash = 'tx_esm_' + Math.random().toString(36).substring(2, 12);

      if (!isSimulator && TariWalletService.isAvailable() && userAddress) {
        // Live Tari Sapient wallet transaction
        const claimResult = await TariWalletService.claimBounty({
          tombId: tomb.id,
          bountyXTR: tomb.bountyXTR,
          claimantAddress: userAddress,
          preimageSolution: solutionInput,
        });
        txHash = claimResult.txHash;
      } else {
        // Sandbox Simulator mode
        await new Promise(res => setTimeout(res, 800));
        txHash = 'tx_sim_ootle_' + Math.random().toString(16).substring(2, 10);
      }

      // 3. Victory!
      sounds.playPlunder();

      // Launch spooky purple & gold confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#fbbf24', '#34d399', '#c084fc'],
      });

      onPlunderSuccess(tomb.id, userAddress || 'otl_esm_1shadow_thief', txHash);
      setIsSubmitting(false);
    } catch (err: any) {
      sounds.playError();
      setErrorMessage(err.message || 'The crypt reject your claim.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border-2 border-purple-800/80 rounded-2xl shadow-[0_0_50px_rgba(147,51,234,0.3)] overflow-hidden text-stone-200">
        {/* Top Header Bar */}
        <div className="bg-stone-950/80 border-b border-purple-900/50 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isPlundered ? '🦴' : '🪦'}</span>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-purple-200 leading-tight">
                {tomb.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
                <span>By: {tomb.creator.slice(0, 16)}...</span>
                <span>•</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
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
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Bounty Reward Card */}
          <div className="flex justify-between items-center p-4 bg-stone-950 border border-purple-900/40 rounded-xl">
            <div>
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block">
                Bounty Treasure
              </span>
              <span className="text-2xl font-bold font-pixel text-emerald-400">
                {tomb.bountyXTR} <span className="text-sm font-sans text-stone-400">XTR</span>
              </span>
            </div>
            <div className="text-right text-xs font-mono text-stone-400">
              <span className="flex items-center justify-end gap-1 text-purple-300">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Tari Stealth Locked
              </span>
              <span className="text-[10px] text-stone-500">Hashlock & Output Stealth Delivery</span>
            </div>
          </div>

          {/* The Epitaph / Spooky Riddle */}
          <div className="relative p-5 bg-stone-950/90 border border-stone-800 rounded-xl">
            <div className="absolute -top-3 left-4 px-2 bg-stone-900 text-[10px] font-mono text-stone-400 uppercase tracking-wider border border-stone-700 rounded">
              Ancient Inscription
            </div>
            <p className="font-serif italic text-base text-stone-200 leading-relaxed text-center py-2">
              "{tomb.epitaph}"
            </p>
          </div>

          {/* Plundered status or Solve Form */}
          {isPlundered ? (
            <div className="p-4 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-stone-400 font-pixel text-xs">
                <Skull className="w-4 h-4 text-stone-500" />
                <span>THIS TOMB HAS BEEN PLUNDERED</span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Looted by: <span className="text-purple-300">{tomb.plunderedBy}</span>
              </p>
              {tomb.txHash && (
                <p className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                  Tx: {tomb.txHash}{' '}
                  <ExternalLink className="w-3 h-3 text-stone-400 inline" />
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
                    className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px]"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> {showHint ? 'Hide Hint' : 'Whisper Hint'}
                  </button>
                </label>

                {showHint && (
                  <div className="mb-2 p-2.5 bg-purple-950/40 border border-purple-900/50 rounded-lg text-xs text-purple-200 italic font-serif">
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

              {/* Wallet connection prompt if user is not connected and not simulator */}
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
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    BREAK SEAL & CLAIM BOUNTY
                  </>
                )}
              </button>
            </form>
          )}

          {/* Educational Privacy Note */}
          <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-500 font-mono flex items-center justify-between">
            <span>Proof: SHA-256 Preimage Verification</span>
            <span>Receiver: Stealth Bech32m (otl_esm)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
