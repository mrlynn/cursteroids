export type Vector = {
  x: number;
  y: number;
};

export type Ship = {
  position: Vector;
  velocity: Vector;
  angle: number;
  radius: number;
};

export type BlockerMechanic = "none" | "armored" | "regen" | "drain";

export type Asteroid = {
  id: number;
  position: Vector;
  velocity: Vector;
  radius: number;
  label: string;
  points: number[];
  rotation: number;
  spin: number;
  mechanic: BlockerMechanic;
  hitPoints: number;
  maxHitPoints: number;
  firstHitAt: number;
  cracked: boolean;
};

export type Bullet = {
  position: Vector;
  velocity: Vector;
  life: number;
};

export type Particle = {
  position: Vector;
  velocity: Vector;
  life: number;
  color: string;
};

export type PowerupKind = "Rules" | "Tab" | "Agent Mode";

export type PowerupPickup = {
  id: number;
  kind: PowerupKind;
  position: Vector;
  velocity: Vector;
  life: number;
  radius: number;
};

export type ActiveEffects = {
  rulesUntil: number;
  tabUntil: number;
  agentUntil: number;
};

export type GameStatus =
  | "ready"
  | "playing"
  | "paused"
  | "debriefing"
  | "gameOver"
  | "missionComplete";

export type PhaseDebriefRecord = {
  phase: number;
  phaseLabel: string;
  strugglingMoment: string;
  intervention: string;
  leaveBehind: string;
  note?: string;
};

export type GameState = {
  width: number;
  height: number;
  status: GameStatus;
  ship: Ship;
  asteroids: Asteroid[];
  bullets: Bullet[];
  particles: Particle[];
  powerups: PowerupPickup[];
  effects: ActiveEffects;
  keys: Set<string>;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  shots: number;
  hits: number;
  nearMisses: number;
  blockersCleared: Record<string, number>;
  powerupsCollected: number;
  powerupsUsedWell: number;
  lastShotAt: number;
  invincibleUntil: number;
  nextAsteroidId: number;
  nextPowerupId: number;
  snapshotTimer: number;
  toast: string | null;
  toastUntil: number;
  debriefs: PhaseDebriefRecord[];
  debriefPhase: number;
  pendingMissionComplete: boolean;
};

export type GameSnapshot = {
  status: GameStatus;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  asteroids: number;
  accuracy: number;
  nearMisses: number;
  blockersCleared: Record<string, number>;
  powerupsCollected: number;
  powerupsUsedWell: number;
  activePowerup: string | null;
  toast: string | null;
  debriefs: PhaseDebriefRecord[];
  debriefPhase: number;
};

export type AdoptionBlocker = {
  label: string;
  fragments: [string, string];
  mechanic: BlockerMechanic;
  hint: string;
};
