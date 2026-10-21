// Types for Tari Ootle & Sapient Extension integration

export interface TariWalletCapabilities {
  walletOwnershipProof?: boolean;
  stealthTransfers?: boolean;
  viewAccess?: boolean;
  templates?: boolean;
  [key: string]: unknown;
}

export interface TariTokenBalance {
  resource_address: string;
  revealed_balance?: string | number;
  confidential_balance?: string | number;
  token_symbol?: string;
  divisibility?: number;
}

export interface TariProvider {
  request: (args: { method: string; params?: Record<string, unknown> }) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    tari?: TariProvider;
  }
}

export interface Tomb {
  id: string;
  name: string;
  epitaph: string; // The spooky riddle or clue
  hint: string;
  creator: string; // Creator's wallet or alias
  bountyXTR: number; // Reward amount in XTR
  answerHash: string; // SHA-256 hash of lowercase trimmed answer
  status: 'sealed' | 'plundered';
  difficulty: 'Apprentice' | 'Necromancer' | 'Arch-Lich';
  x: number; // Map platform coordinates
  y: number;
  plunderedBy?: string;
  lootedAt?: string;
  txHash?: string;
}
