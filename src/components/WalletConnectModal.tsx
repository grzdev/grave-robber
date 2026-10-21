import React from 'react';
import { X, Download, RefreshCw, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasSapient: boolean;
  onConnectLive: () => void;
  onEnableSimulator: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  hasSapient,
  onConnectLive,
  onEnableSimulator,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border-2 border-purple-800 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden text-stone-200">
        {/* Top Header */}
        <div className="bg-stone-950 p-5 border-b border-purple-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center text-xl">
              🗝️
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-purple-200">
                Connect Tari Wallet
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Self-custody programmable privacy on Ootle
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

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {hasSapient ? (
            /* Sapient is detected! */
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Sapient Web Extension Detected</span>
              </div>
              <p className="text-xs text-stone-300 font-mono leading-relaxed">
                Your browser has the Sapient Chrome extension installed and ready to authorize stealth transactions on the Tari Esmeralda testnet.
              </p>
              <button
                onClick={() => {
                  onConnectLive();
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-pixel text-xs rounded-xl shadow-lg border border-emerald-400/40 cursor-pointer flex items-center justify-center gap-2"
              >
                Connect Sapient Extension
              </button>
            </div>
          ) : (
            /* Sapient NOT detected - Provide clear paths */
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl space-y-2">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                  Sapient Extension Not Detected in this Tab
                </span>
                <p className="text-xs text-stone-300 font-mono leading-relaxed">
                  To connect your real testnet wallet, you need the <strong>Sapient Chrome Extension</strong> or run inside the <strong>Tari Universe</strong> web wallet.
                </p>
              </div>

              {/* Option 1: Install Sapient Extension */}
              <div className="p-4 bg-stone-950 border border-purple-900/40 rounded-2xl hover:border-purple-600 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-200">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Option 1: Install Sapient (Official Bonus Wallet)</span>
                  </div>
                  <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono border border-purple-800">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-mono">
                  Install the free open-source Chrome extension to test live on-chain stealth signatures.
                </p>
                <div className="pt-1 flex gap-2">
                  <a
                    href="https://chromewebstore.google.com/detail/tari-ootle-wallet/demkeckolenopkgnfbnpflkpbbdhpgkl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-purple-800 hover:bg-purple-700 text-white font-pixel text-[10px] rounded-xl text-center flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" /> Chrome Web Store
                  </a>
                  <a
                    href="https://sapient.tari.mw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-mono text-xs rounded-xl flex items-center justify-center gap-1"
                  >
                    Website <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Option 2: Instant Sandbox Simulator */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl hover:border-stone-700 transition-all space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-stone-200">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Option 2: Instant Sandbox Simulator (No Install)</span>
                </div>
                <p className="text-xs text-stone-400 font-mono">
                  Test the complete game immediately with simulated Tari testnet blocks, 1,250 test XTR, and instant cryptographic hashlock verification.
                </p>
                <button
                  onClick={() => {
                    onEnableSimulator();
                    onClose();
                  }}
                  className="w-full mt-1 py-2.5 bg-gradient-to-r from-stone-800 to-stone-700 hover:from-stone-700 hover:to-stone-600 text-emerald-300 font-pixel text-[10px] rounded-xl border border-stone-600 cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Continue in Sandbox Simulator
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-stone-950 border-t border-purple-950/80 text-[11px] text-stone-500 font-mono flex justify-between items-center">
          <span>Tari Ootle Esmeralda Network</span>
          <span>Bech32m Stealth Addresses</span>
        </div>
      </div>
    </div>
  );
};
