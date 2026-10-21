# 🪦 Grave Robber — The Crypt of Tari Secrets

> **A 2D gothic crypt heist & cryptographic riddle bounty dApp built on Tari Ootle programmable privacy and the Sapient Web Extension.**

Built for the **Tari October Build Contest: Spooky Secrets** and the **Sapient Community Bonus Challenge**.

---

## 🎃 What is Grave Robber?

On transparent blockchains (like Ethereum or Solana), putting a puzzle or bounty with an on-chain solution is fatally flawed:
* **The Front-Running Bot Trap:** As soon as an honest solver broadcasts their answer, mempool bots copy the solution, front-run the transaction with higher priority gas fees, and steal the bounty.
* **Identity Leakage:** The winner's entire wallet history, assets, and future transactions are permanently linked to the claim.

**Grave Robber** solves this using **Tari Ootle's programmable privacy** and the **Sapient Web Extension**:
1. **Preimage Hashlocks:** Riddles are sealed with SHA-256 / Blake2b cryptographic commitments.
2. **Stealth Payouts (`sendPrivately`):** When a tomb's seal is broken, the bounty is delivered directly into a one-time, unlinkable **bech32m stealth address** (`otl_esm_1...`). Observers see the crypt was opened, but *never* which wallet received the bounty.
3. **2D Retro Catacomb Platformer:** Players physically traverse atmospheric, candle-lit catacombs, explore tombs, solve ancient occult riddles, or visit the Altar to bury their own secret treasures with XTR bounties.

---

## 🦇 Key Features

- **🎮 Dual Mode Experience:**
  - **2D Catacomb Explorer:** Retro side-scrolling platformer with dynamic lantern light masks, torches, atmospheric sound, and interactive tombs.
  - **Crypt Ledger Inspector:** Quick table view designed for judges and power users to inspect all hashlocks, transactions, and crypt statuses with 1 click.
- **🛡️ Full Sapient Extension Integration:**
  - Injects `window.tari` via `https://universe.tari.mw/tari-connector.js`.
  - Connects to accounts with `tari_requestAccounts`.
  - Retrieves stealth bech32m addresses with `tari_getWalletAddress`.
  - Features detection via `tari_getCapabilities`.
  - Claims bounties via `tari_createTransactionRequest` (`kind: "sendPrivately"`).
- **🧪 Sandbox Simulator Mode:**
  - Includes a built-in testnet simulator with cryptographic verification and realistic block generation so judges can test every feature immediately even without live testnet funds.
- **🔊 Procedural 8-Bit Web Audio:**
  - 100% self-contained retro sound synthesizer (jumps, chest opening arpeggios, riddle curses, ambient dungeon hums). Zero external audio dependencies.
- **⚰️ "Dig a New Grave" Altar:**
  - Anyone can deposit testnet XTR, carve an ominous riddle, and create a permanent on-chain tomb for other players to loot.

---

## 🔮 Cryptography & Tari Ootle Primitives

| Primitive | Usage in Grave Robber |
| :--- | :--- |
| **`window.tari` Provider** | Standard EIP-style provider injected by the Sapient Chrome Extension. |
| **Stealth Addresses (`otl_esm_...`)** | Every plunder routes to a stealth one-time address, breaking linkability. |
| **`tari_createTransactionRequest`** | Creates private spend requests (`kind: "sendPrivately"`, `kind: "shield"`). |
| **`tari_signWalletOwnershipChallenge`** | Zero-knowledge challenge-response proof that solver owns the destination key. |
| **SHA-256 Preimage Verification** | Validates the riddle answer client-side before triggering on-chain redemption. |

---

## 🕹️ Controls (2D Platformer)

* **Move:** `A` / `D` or `Left Arrow` / `Right Arrow`
* **Jump:** `W` or `Space` or `Up Arrow`
* **Inspect Tomb / Plunder:** `E` or `Enter`
* **Bury Loot (at Altar):** Stand near the Altar (far right) and press `E`
* **Touch Controls:** On-screen touch buttons for mobile & tablet support.

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- Recommended: [Sapient Web Extension](https://sapient.tari.mw) installed in Chrome

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/grave-robber.git
cd grave-robber

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🏆 Contest Submission Details

* **Theme:** Spooky Secrets
* **Official Contest:** [Tari October Build Contest Thread #396](https://community.tari.com/t/october-build-contest-thread-spooky-secrets/396)
* **Bonus Challenge:** [0xhra Sapient Community Bonus Contest #463](https://community.tari.com/t/spooky-secrets-community-bonus-contest/463)
* **License:** [MIT License](./LICENSE)

---

## 📜 Social Announcement Draft (for Bluesky / Reddit)

### Reddit (`r/tari`) / Bluesky:
> **🪦 Grave Robber: A 2D Gothic Crypt Heist on Tari Ootle & Sapient**
>
> For this month’s "Spooky Secrets" contest, I built **Grave Robber** — a playable 2D retro catacomb platformer where you explore haunted tombs, solve occult riddles, and plunder stealth XTR bounties.
>
> On transparent chains, riddle bounties get stolen by mempool bots. On Tari, the bounty is delivered directly to your Sapient stealth address with zero linkability.
>
> 🎮 Playable demo & source: [LINK]
> 
> #Tari #SpookySecrets #Privacy #Web3 #Gaming
