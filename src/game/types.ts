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

export type BlockerMechanic = "none" | "armored" | "regen" | "drain" | "convert";

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
  /** Cumulative pairing progress toward conversion, 0..1 (convert-type only). */
  pairing: number;
  /** True once a convert-type blocker has flipped to an ally. */
  converted: boolean;
  /** Timestamp when a converted ally despawns. */
  convertedUntil: number;
  /** True if this spawn was pre-weakened by Rules coverage. */
  preWeakened: boolean;
  /** True once the first-hit "won't break" hint has been shown for this blocker. */
  hintShown: boolean;
};

export type Bullet = {
  position: Vector;
  velocity: Vector;
  life: number;
};

export type Tracer = {
  from: Vector;
  to: Vector;
  life: number;
  maxLife: number;
  tab: boolean;
};

export type Particle = {
  position: Vector;
  velocity: Vector;
  life: number;
  color: string;
};

export type PowerupKind = "Rules" | "MCP" | "Cloud Agent" | "Dashboard";

export type PowerupPickup = {
  id: number;
  kind: PowerupKind;
  position: Vector;
  velocity: Vector;
  life: number;
  radius: number;
};

export type ActiveEffects = {
  mcpUntil: number;
  dashboardUntil: number;
  /** Stored Cloud Agent deploy charges, max AGENT_MAX_CHARGES. */
  agentCharges: number;
  /** Blocker labels permanently pre-weakened by a shipped Rules artifact. */
  rulesCoverage: Record<string, boolean>;
};

export type AgentDrone = {
  position: Vector;
  velocity: Vector;
  targetId: number | null;
  until: number;
  kills: number;
  trail: Vector[];
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

/** One of the four concrete next-wave modifiers a retro choice can apply. */
export type ModifierKind = "rules" | "mcp" | "cloud-agent" | "dashboard";

export type GameState = {
  width: number;
  height: number;
  status: GameStatus;
  ship: Ship;
  asteroids: Asteroid[];
  bullets: Bullet[];
  tracers: Tracer[];
  particles: Particle[];
  powerups: PowerupPickup[];
  effects: ActiveEffects;
  agent: AgentDrone | null;
  score: number;
  highScore: number;
  trust: number;
  level: number;
  shots: number;
  hits: number;
  missStreak: number;
  nearMisses: number;
  tabAccepts: number;
  conversions: number;
  agentDeploys: number;
  blockersCleared: Record<string, number>;
  powerupsCollected: number;
  powerupsUsedWell: number;
  lastShotAt: number;
  lastTabAcceptAt: number;
  invincibleUntil: number;
  nextAsteroidId: number;
  nextPowerupId: number;
  snapshotTimer: number;
  toast: string | null;
  toastUntil: number;
  debriefs: PhaseDebriefRecord[];
  debriefPhase: number;
  pendingMissionComplete: boolean;
  /** Currently suggested Tab-fire target, recomputed every frame. */
  suggestionTargetId: number | null;
  /** Modifier applied to the current wave from the previous phase's retro choice. */
  waveModifier: ModifierKind | null;
  /** Human-readable description of the active wave modifier, for HUD/toast use. */
  waveModifierLabel: string | null;
  waveIntroUntil: number;
  shakeUntil: number;
  shakeDuration: number;
  shakeStrength: number;
  hitStopUntil: number;
  thrusting: boolean;
};

export type GameSnapshot = {
  status: GameStatus;
  score: number;
  highScore: number;
  trust: number;
  level: number;
  asteroids: number;
  accuracy: number;
  nearMisses: number;
  tabAccepts: number;
  conversions: number;
  agentDeploys: number;
  agentCharges: number;
  rulesCoverageCount: number;
  blockersCleared: Record<string, number>;
  powerupsCollected: number;
  powerupsUsedWell: number;
  activePowerup: string | null;
  toast: string | null;
  debriefs: PhaseDebriefRecord[];
  debriefPhase: number;
  waveModifierLabel: string | null;
};

export type AdoptionBlocker = {
  label: string;
  fragments: [string, string];
  mechanic: BlockerMechanic;
  hint: string;
};
