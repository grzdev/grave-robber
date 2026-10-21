import React, { useState } from 'react';
import type { Tomb } from '../types/tari';
import { ShieldCheck, Skull, Key, Lock, Search } from 'lucide-react';

interface CryptLedgerProps {
  tombs: Tomb[];
  onSelectTomb: (tomb: Tomb) => void;
  onOpenBuryModal: () => void;
  onResetTombs?: () => void;
}

export const CryptLedger: React.FC<CryptLedgerProps> = ({
  tombs,
  onSelectTomb,
  onOpenBuryModal,
  onResetTombs,
}) => {
  const [filter, setFilter] = useState<'all' | 'sealed' | 'plundered'>('all');
  const [search, setSearch] = useState('');

  const filtered = tombs.filter(t => {
    if (filter === 'sealed' && t.status !== 'sealed') return false;
    if (filter === 'plundered' && t.status !== 'plundered') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.epitaph.toLowerCase().includes(q) ||
        t.difficulty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-stone-900/80 border border-purple-900/40 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search crypts by name or riddle..."
              className="pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-purple-500 w-64"
            />
          </div>

          <div className="flex gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-mono">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg ${filter === 'all' ? 'bg-purple-900 text-purple-200' : 'text-stone-400 hover:text-white'}`}
            >
              All ({tombs.length})
            </button>
            <button
              onClick={() => setFilter('sealed')}
              className={`px-3 py-1 rounded-lg ${filter === 'sealed' ? 'bg-purple-900 text-purple-200' : 'text-stone-400 hover:text-white'}`}
            >
              Sealed ({tombs.filter(t => t.status === 'sealed').length})
            </button>
            <button
              onClick={() => setFilter('plundered')}
              className={`px-3 py-1 rounded-lg ${filter === 'plundered' ? 'bg-purple-900 text-purple-200' : 'text-stone-400 hover:text-white'}`}
            >
              Plundered ({tombs.filter(t => t.status === 'plundered').length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onResetTombs && (
            <button
              onClick={onResetTombs}
              className="px-3 py-2 bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-mono cursor-pointer transition-colors"
              title="Reset all plundered tombs back to sealed state for testing"
            >
              🔄 Reset Crypts
            </button>
          )}

          <button
            onClick={onOpenBuryModal}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-800 to-purple-800 hover:from-fuchsia-700 hover:to-purple-700 text-white font-pixel text-xs rounded-xl border border-fuchsia-400/40 flex items-center gap-2 shadow-lg"
          >
            <span>⚰️</span> Dig New Grave
          </button>
        </div>
      </div>

      {/* Grid of Tombs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(tomb => {
          const isPlundered = tomb.status === 'plundered';

          return (
            <div
              key={tomb.id}
              className={`relative p-5 rounded-2xl border transition-all ${
                isPlundered
                  ? 'bg-stone-950/60 border-stone-800 opacity-80'
                  : 'bg-stone-900/90 border-purple-900/50 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{isPlundered ? '🦴' : '🪦'}</span>
                  <div>
                    <h4 className="font-cinzel font-bold text-base text-stone-100">
                      {tomb.name}
                    </h4>
                    <span className="text-[11px] font-mono text-stone-500 block">
                      Creator: {tomb.creator.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                    tomb.difficulty === 'Arch-Lich'
                      ? 'bg-red-950 text-red-300 border border-red-900'
                      : tomb.difficulty === 'Necromancer'
                      ? 'bg-purple-950 text-purple-300 border border-purple-900'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                  }`}
                >
                  {tomb.difficulty}
                </span>
              </div>

              {/* Inscription */}
              <p className="font-serif italic text-xs text-stone-300 mb-4 bg-stone-950/70 p-3 rounded-xl border border-stone-800/80 leading-relaxed">
                "{tomb.epitaph}"
              </p>

              {/* Hash Proof & Bounty details */}
              <div className="space-y-1.5 mb-4 text-[11px] font-mono text-stone-400">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-stone-500">
                    <Lock className="w-3 h-3 text-purple-400" /> Preimage Hash (SHA-256):
                  </span>
                  <code className="text-[10px] text-purple-300 bg-stone-950 px-1.5 py-0.5 rounded border border-purple-950">
                    {tomb.answerHash.slice(0, 12)}...{tomb.answerHash.slice(-6)}
                  </code>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-stone-500">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Bounty:
                  </span>
                  <span className="font-pixel text-xs text-emerald-400 font-bold">
                    {tomb.bountyXTR} XTR
                  </span>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-stone-800/80 flex justify-between items-center">
                {isPlundered ? (
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                    <Skull className="w-4 h-4" /> Plundered by {tomb.plunderedBy?.slice(0, 12)}...
                  </div>
                ) : (
                  <span className="text-xs text-purple-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Tomb Sealed & Ready
                  </span>
                )}

                <button
                  onClick={() => onSelectTomb(tomb)}
                  className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] flex items-center gap-1.5 cursor-pointer transition-all ${
                    isPlundered
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                      : 'bg-purple-800 hover:bg-purple-700 text-white shadow-md'
                  }`}
                >
                  <Key className="w-3 h-3" />
                  {isPlundered ? 'Inspect' : 'Solve & Plunder'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
