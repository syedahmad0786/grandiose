export const SAVE_STAGES = [
  "Consulting the cartographers",
  "Waxing the imperial seal",
  "Alerting the night watch",
  "Engraving the marble ledger",
  "Folding spacetime around the file",
  "Blessing the inode",
  "Filing under destiny",
] as const;

export const BUSY_OPS = [
  "Reconciling the ledgers",
  "Warming the orchestra pit",
  "Counting unsaved souls",
  "Calibrating gravitas",
  "Pretending to compile",
  "Polishing the wax seal",
  "Briefing the chorus",
  "Staging a harmless crisis",
] as const;

export function pickBusy(): string {
  const i = Math.floor(Math.random() * BUSY_OPS.length);
  return BUSY_OPS[i] ?? BUSY_OPS[0];
}

export const CEREMONIES = {
  solemn: {
    kicker: "REQUIEM",
    title: "THE LAST LIGHT",
    sub: "The company lays down its arms.",
    done: "Credits roll on an empty stage.",
  },
  funny: {
    kicker: "EXIT INTERVIEW",
    title: "THE TAB HAS LEFT THE BUILDING",
    sub: "It took the cookies. It left a note: 'lmao'.",
    done: "HR will not be following up.",
  },
  oscar: {
    kicker: "AND THE AWARD GOES TO",
    title: "CLOSING",
    sub: "A standing ovation for a window that no longer exists.",
    done: "Please hold your applause. There is nobody left to hear it.",
  },
} as const;

export type CeremonyFlavor = keyof typeof CEREMONIES;

export const COPY = {
  save: {
    kicker: "CLASSIFIED // FT–005",
    title: "PRESERVING THE RECORD",
    sub: "A mundane save has been elevated to state occasion.",
    done: "THE RECORD IS SAFE",
  },
  mission: {
    kicker: "DISPATCH",
    title: "MISSION",
    sub: "A new frontier has opened. Godspeed.",
    done: "THE COMPANY ADVANCES",
  },
  ceremony: CEREMONIES.solemn,
  busy: {
    kicker: "ONGOING",
    title: "LOOK BUSY",
    sub: "An operation of tremendous unimportance.",
    done: "STILL LOOKING BUSY",
  },
} as const;
