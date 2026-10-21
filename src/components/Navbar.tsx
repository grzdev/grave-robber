import React from 'react';
import { sounds } from '../services/soundEffects';
import { Volume2, VolumeX, Shield, Gamepad2, ScrollText, Download, Wallet, RefreshCw } from 'lucide-react';

interface NavbarProps {
  viewMode: 'game' | 'ledger';
  setViewMode: (mode: 'game' | 'ledger') => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isSimulator: boolean;
  setIsSimulator: (sim: boolean) => void;
  userAddress: string;
  userBalance: number;
  onOpenWalletModal: () => void;
  onOpenPrivacyGuide: () => void;
  hasSapient: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  isMuted,
  setIsMuted,
  isSimulator,
  setIsSimulator,
  userAddress,
  userBalance,
  onOpenWalletModal,
  onOpenPrivacyGuide,
  hasSapient,
}) => {
  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <header className="border-b border-purple-950/80 bg-stone-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
        {/* Brand & Theme */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            🪦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel font-black text-xl text-purple-200 tracking-wider">
                GRAVE ROBBER
              </h1>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-semibold">
                Spooky Secrets '26
              </span>
            </div>
            <p className="text-[11px] font-mono text-stone-400">
              The Zero-Knowledge Crypt Heist on <span className="text-emerald-400 font-bold">Tari Ootle</span>
            </p>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center gap-1 bg-stone-900 border border-purple-950 p-1 rounded-xl font-pixel text-[10px]">
          <button
            onClick={() => { setViewMode('game'); sounds.playStep?.(); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'game'
                ? 'bg-purple-800 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" /> 2D Explorer
          </button>
          <button
            onClick={() => { setViewMode('ledger'); sounds.playStep?.(); }}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'ledger'
                ? 'bg-purple-800 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" /> Crypt Ledger
          </button>
        </div>

        {/* Right Actions: Sound, Privacy Specs, Mode Toggle, Wallet */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute 8-bit sound' : 'Mute sound'}
            className="p-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-400 hover:text-stone-200 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Privacy Specs Modal Button */}
          <button
            onClick={onOpenPrivacyGuide}
            className="p-2 bg-stone-900 hover:bg-stone-800 border border-purple-900/40 rounded-xl text-purple-300 hover:text-purple-100 transition-colors flex items-center gap-1 text-xs font-mono"
            title="How Tari Programmable Privacy Works in Grave Robber"
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="hidden lg:inline text-[11px]">Why Tari?</span>
          </button>

          {/* Live vs Simulator Toggle */}
          <button
            onClick={() => setIsSimulator(!isSimulator)}
            title="Toggle between Live Sapient Wallet and Sandbox Simulator"
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
              isSimulator
                ? 'bg-amber-950/50 border-amber-800/80 text-amber-300'
                : 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
            }`}
          >
            <RefreshCw className="w-3 h-3 animate-spin-slow" />
            <span className="hidden sm:inline">{isSimulator ? 'Sandbox Sim' : 'Live Wallet'}</span>
          </button>

          {/* Wallet Connect Button */}
          {userAddress ? (
            <button
              onClick={onOpenWalletModal}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-purple-700/60 rounded-xl flex items-center gap-2 text-xs font-mono cursor-pointer transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-stone-300 font-bold">
                {userBalance} <span className="text-emerald-400">XTR</span>
              </span>
              <span className="text-stone-500 hidden md:inline">
                {userAddress.slice(0, 8)}...{userAddress.slice(-4)}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-pixel text-[10px] rounded-xl shadow-lg border border-purple-400/40 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-300" />
              Connect Wallet
            </button>
          )}

          {/* Quick Install Link if Sapient is not detected */}
          {!hasSapient && (
            <a
              href="https://sapient.tari.mw"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-400 hover:text-stone-200 text-[11px] font-mono"
            >
              <Download className="w-3 h-3 text-purple-400" /> Get Sapient
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
