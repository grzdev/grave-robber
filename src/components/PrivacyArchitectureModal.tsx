import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Cpu, ExternalLink } from 'lucide-react';

interface PrivacyArchitectureModalProps {
  onClose: () => void;
}

export const PrivacyArchitectureModal: React.FC<PrivacyArchitectureModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border-2 border-purple-800 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.3)] overflow-hidden text-stone-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-950 p-4 border-b border-purple-900/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-700/60 text-purple-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-purple-200">
                Tari Ootle & Sapient Privacy Architecture
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Why Grave Robber requires Tari's programmable privacy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-300 font-mono leading-relaxed">
          {/* Problem vs Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <Lock className="w-4 h-4" /> The Transparent Chain Problem
              </div>
              <p className="text-[11px] text-stone-400">
                On transparent blockchains (Ethereum, Solana), if you submit a riddle solution on-chain, 
                mempool bots immediately see the transaction, copy your answer, pay higher gas, and steal your bounty 
                before you can claim it. Furthermore, your public address is permanently linked to the claim.
              </p>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <EyeOff className="w-4 h-4" /> The Tari Ootle Solution
              </div>
              <p className="text-[11px] text-stone-400">
                Tari Ootle provides <strong>programmable privacy</strong>. The bounty is sealed with a 
                preimage hashlock, and payout is routed through <strong>Sapient’s stealth transfers</strong>. 
                Even observers scanning the block cannot see the claimant's public identity or associate 
                subsequent spends with the plundered crypt.
              </p>
            </div>
          </div>

          {/* Core Primitives Utilized */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> Privacy Primitives in this Game
            </h4>

            <div className="space-y-2">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-purple-400 font-bold">1. Sapient Provider (`window.tari`):</span>
                <p className="text-[11px] text-stone-400 mt-1">
                  Connects via <code>tari_requestAccounts</code> and retrieves the user's Bech32m 
                  stealth address (<code>otl_esm_1...</code>) via <code>tari_getWalletAddress</code>.
                </p>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-emerald-400 font-bold">2. Stealth Redemption (`sendPrivately`):</span>
                <p className="text-[11px] text-stone-400 mt-1">
                  Calls <code>tari_createTransactionRequest</code> with <code>kind: "sendPrivately"</code> to 
                  generate a one-time stealth UTXO payout to the winner, preventing any trace of the winner's account address on-chain.
                </p>
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                <span className="text-amber-400 font-bold">3. Zero-Knowledge Preimage Verification:</span>
                <p className="text-[11px] text-stone-400 mt-1">
                  Tombs store only the SHA-256 hash. The solver generates the preimage proof client-side, 
                  ensuring the plain text answer is never exposed in advance.
                </p>
              </div>
            </div>
          </div>

          {/* Links for judges */}
          <div className="p-3 bg-stone-950/80 border border-purple-900/40 rounded-xl flex flex-wrap justify-between items-center gap-2">
            <span className="text-[11px] text-stone-400">
              Built for Tari October Contest & Sapient Bonus Challenge
            </span>
            <div className="flex gap-3 text-xs">
              <a
                href="https://sapient.tari.mw"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
              >
                Sapient Wallet <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://universe.tari.mw/integrations"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
              >
                Tari dApp Docs <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
