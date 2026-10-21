import type { Tomb } from '../types/tari';

export const INITIAL_TOMBS: Tomb[] = [
  {
    id: 'tomb-1',
    name: "The Screaming Spectre's Crypt",
    epitaph: 'I have no flesh, no feathers, no scales, and no bone. Yet I have four fingers and a thumb of my own. What am I?',
    hint: 'A skeletal hand wears one in the dead of winter...',
    creator: 'otl_esm_1gravekeeper_phantom',
    bountyXTR: 250,
    answerHash: '4bc529d33e80672d2c818851c8974428eddab767b45ce0e948d36e93218ed45d', // glove
    status: 'sealed',
    difficulty: 'Apprentice',
    x: 280,
    y: 330,
  },
  {
    id: 'tomb-2',
    name: "The Vampire King's Reliquary",
    epitaph: 'The person who makes it has no need of it; the person who buys it has no use for it. The person who uses it can neither see nor feel it. What is it?',
    hint: 'Where the immortal sleeps during daylight hours...',
    creator: 'otl_esm_1vampire_lord_vlad',
    bountyXTR: 500,
    answerHash: 'e22665cad68137f2ddcd46eb4751820ac64ebb68669212351c6d7193288e7f63', // coffin
    status: 'sealed',
    difficulty: 'Necromancer',
    x: 650,
    y: 210,
  },
  {
    id: 'tomb-3',
    name: 'Sanctum of the Zero-Knowledge Lich',
    epitaph: 'I can be addressed without being identified. I can hold wealth while keeping balance and ownership obscured. What Tari privacy primitive am I?',
    hint: 'Think of Tari Ootle’s 7-letter private address mechanism...',
    creator: 'otl_esm_1cypherpunk_lich',
    bountyXTR: 1000,
    answerHash: '2d998cb471a020c0c58428d556cb5125365cac15eba3508faf2301e94bd88429', // stealth
    status: 'sealed',
    difficulty: 'Arch-Lich',
    x: 1040,
    y: 110,
  },
  {
    id: 'tomb-4',
    name: 'The Drowned Hollow Sarcophagus',
    epitaph: 'What runs but never walks, has a bed but never sleeps, has a mouth but never speaks, and hides in the darkest damp hollows of the catacombs?',
    hint: 'Flows endlessly under the cobblestone floors...',
    creator: 'otl_esm_1water_ghoul_stewart',
    bountyXTR: 350,
    answerHash: '5f5a8ed8f139be6df7cf8f4a91d3e4649961a98c82fd521c18d6f292b031a319', // river
    status: 'sealed',
    difficulty: 'Necromancer',
    x: 1420,
    y: 330,
  },
];
