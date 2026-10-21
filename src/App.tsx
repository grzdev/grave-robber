import { useState, useEffect } from 'react';
import type { Tomb } from './types/tari';
import { INITIAL_TOMBS } from './data/defaultTombs';
import { TariWalletService } from './services/tariWallet';
import { sounds } from './services/soundEffects';
import { Navbar } from './components/Navbar';
import { CryptPlatformer } from './components/CryptPlatformer';
import { CryptLedger } from './components/CryptLedger';
import { TombModal } from './components/TombModal';
import { BuryTombModal } from './components/BuryTombModal';
import { PrivacyArchitectureModal } from './components/PrivacyArchitectureModal';
import { WalletConnectModal } from './components/WalletConnectModal';
import { ShieldCheck, Sparkles, Ghost, Award, ExternalLink } from 'lucide-react';

export function App() {
  // Tombs state (persisted in localStorage)
  const [tombs, setTombs] = useState<Tomb[]>(() => {
    const saved = localStorage.getItem('graverobber_tombs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved tombs', e);
      }
    }
    return INITIAL_TOMBS;
  });

  // UI state
  const [selectedTomb, setSelectedTomb] = useState<Tomb | null>(null);
  const [isBuryModalOpen, setIsBuryModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'game' | 'ledger'>('game');
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  // Wallet / Simulator state
  const [hasSapient, setHasSapient] = useState(false);
  const [isSimulator, setIsSimulator] = useState(true);
  const [userAddress, setUserAddress] = useState('otl_esm_1shadow_grave_robber_demo');
  const [userBalance, setUserBalance] = useState(1250); // Default demo balance in XTR

  // Detect Sapient on load
  useEffect(() => {
    const checkSapient = () => {
      const available = TariWalletService.isAvailable();
      setHasSapient(available);
      if (available) {
        setIsSimulator(false);
      }
    };

    checkSapient();
    const timer = setTimeout(checkSapient, 800);
    return () => clearTimeout(timer);
  }, []);

  // Save tombs whenever updated
  useEffect(() => {
    localStorage.setItem('graverobber_tombs', JSON.stringify(tombs));
  }, [tombs]);

  // Connect Live Sapient Wallet
  const handleConnectLive = async () => {
    try {
      const res = await TariWalletService.connect();
      setUserAddress(res.walletAddress || res.address);
      setIsSimulator(false);
      if (res.balances && res.balances.length > 0) {
        const bal = Number(res.balances[0].revealed_balance || 1000);
        setUserBalance(bal);
      }
      sounds.playInspect();
    } catch (err: any) {
      if (err.message === 'SAPIENT_NOT_INSTALLED') {
        setIsWalletModalOpen(true);
      } else {
        alert(err.message || 'Failed to connect to Sapient');
      }
    }
  };

  // Enable Sandbox Simulator
  const handleEnableSimulator = () => {
    setIsSimulator(true);
    setUserAddress('otl_esm_1shadow_grave_robber_demo');
    setUserBalance(1250);
    sounds.playInspect();
  };

  // Plunder Success
  const handlePlunderSuccess = (tombId: string, robberAddress: string, txHash: string) => {
    setTombs(prev =>
      prev.map(t => {
        if (t.id === tombId) {
          setUserBalance(b => b + t.bountyXTR);
          return {
            ...t,
            status: 'plundered',
            plunderedBy: robberAddress,
            lootedAt: new Date().toLocaleTimeString(),
            txHash,
          };
        }
        return t;
      })
    );
  };

  // Bury Success
  const handleBurySuccess = (newTomb: Tomb) => {
    setUserBalance(b => Math.max(0, b - newTomb.bountyXTR));
    setTombs(prev => [newTomb, ...prev]);
  };

  // Reset All Tombs back to Initial Sealed State
  const handleResetTombs = () => {
    localStorage.removeItem('graverobber_tombs');
    setTombs(INITIAL_TOMBS);
    setUserBalance(1250);
    sounds.playInspect();
  };

  // Stats
  const sealedCount = tombs.filter(t => t.status === 'sealed').length;
  const plunderedCount = tombs.filter(t => t.status === 'plundered').length;
  const totalBounty = tombs
    .filter(t => t.status === 'sealed')
    .reduce((acc, t) => acc + t.bountyXTR, 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isSimulator={isSimulator}
        setIsSimulator={setIsSimulator}
        userAddress={userAddress}
        userBalance={userBalance}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenPrivacyGuide={() => setIsPrivacyModalOpen(true)}
        hasSapient={hasSapient}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Atmospheric Hero Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/70 via-stone-950 to-stone-900 border border-purple-800/40 p-6 md:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-purple-300 text-xs font-mono font-medium">
                <Ghost className="w-3.5 h-3.5 text-purple-400" />
                <span>October Build Challenge &bull; Spooky Secrets</span>
              </div>
              <h2 className="font-cinzel text-2xl md:text-3xl font-black text-white tracking-wide">
                Loot the Cursed Crypts of Tari
              </h2>
              <p className="text-xs md:text-sm text-stone-400 leading-relaxed font-mono">
                Explore the catacombs, decipher ancient riddles, and plunder stealth XTR bounties.
                Every solution is proven cryptographically client-side and delivered to your private
                stealth address without mempool front-running.
              </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="flex gap-3 font-mono">
              <div className="p-3.5 bg-stone-900/90 border border-purple-900/50 rounded-2xl text-center min-w-[100px]">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">
                  Sealed
                </span>
                <span className="text-xl font-bold font-pixel text-purple-300">
                  {sealedCount}
                </span>
              </div>
              <div className="p-3.5 bg-stone-900/90 border border-emerald-900/50 rounded-2xl text-center min-w-[100px]">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">
                  Unclaimed XTR
                </span>
                <span className="text-xl font-bold font-pixel text-emerald-400">
                  {totalBounty}
                </span>
              </div>
              <div className="p-3.5 bg-stone-900/90 border border-stone-800 rounded-2xl text-center min-w-[100px]">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest block">
                  Plundered
                </span>
                <span className="text-xl font-bold font-pixel text-stone-300">
                  {plunderedCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Content: 2D Platformer OR Crypt Ledger */}
        {viewMode === 'game' ? (
          <div className="space-y-4">
            <CryptPlatformer
              tombs={tombs}
              onSelectTomb={t => setSelectedTomb(t)}
              onOpenBuryModal={() => setIsBuryModalOpen(true)}
            />
          </div>
        ) : (
          <CryptLedger
            tombs={tombs}
            onSelectTomb={t => setSelectedTomb(t)}
            onOpenBuryModal={() => setIsBuryModalOpen(true)}
            onResetTombs={handleResetTombs}
          />
        )}

        {/* Feature Highlights Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 bg-stone-900/60 border border-purple-900/30 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-cinzel font-bold text-sm text-stone-200">
              Anti-Frontrunning Hashlocks
            </h4>
            <p className="text-xs text-stone-400 font-mono leading-relaxed">
              Riddle answers never touch the mempool in plain text. Solvers commit preimages directly
              bound to their stealth keys so bot snipers cannot steal the claim.
            </p>
          </div>

          <div className="p-5 bg-stone-900/60 border border-purple-900/30 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-cinzel font-bold text-sm text-stone-200">
              Sapient Web Extension Ready
            </h4>
            <p className="text-xs text-stone-400 font-mono leading-relaxed">
              Integrates directly with <code>window.tari</code> to request accounts, verify wallet
              ownership challenges, and settle confidential stealth payments.
            </p>
          </div>

          <div className="p-5 bg-stone-900/60 border border-purple-900/30 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-950 flex items-center justify-center text-purple-300">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-cinzel font-bold text-sm text-stone-200">
              Bury Your Own Secret
            </h4>
            <p className="text-xs text-stone-400 font-mono leading-relaxed">
              Deposit testnet XTR, carve an ominous riddle, and create a permanent on-chain tomb for
              other adventurers to loot.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-purple-950/60 bg-stone-950 py-8 px-4 text-xs font-mono text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>🪦 Grave Robber</span>
            <span>&bull;</span>
            <span>Built for the Tari October Spooky Secrets Contest</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://sapient.tari.mw"
              target="_blank"
              rel="noreferrer"
              className="text-stone-400 hover:text-purple-300 flex items-center gap-1"
            >
              Sapient Wallet <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://universe.tari.mw/integrations"
              target="_blank"
              rel="noreferrer"
              className="text-stone-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Tari Integrations <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://community.tari.com"
              target="_blank"
              rel="noreferrer"
              className="text-stone-400 hover:text-amber-300 flex items-center gap-1"
            >
              Tari Community <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        hasSapient={hasSapient}
        onConnectLive={handleConnectLive}
        onEnableSimulator={handleEnableSimulator}
      />

      {selectedTomb && (
        <TombModal
          tomb={selectedTomb}
          userAddress={userAddress}
          isSimulator={isSimulator}
          onClose={() => setSelectedTomb(null)}
          onPlunderSuccess={handlePlunderSuccess}
          onConnectWallet={() => setIsWalletModalOpen(true)}
        />
      )}

      {isBuryModalOpen && (
        <BuryTombModal
          userAddress={userAddress}
          isSimulator={isSimulator}
          onClose={() => setIsBuryModalOpen(false)}
          onBurySuccess={handleBurySuccess}
        />
      )}

      {isPrivacyModalOpen && (
        <PrivacyArchitectureModal onClose={() => setIsPrivacyModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
