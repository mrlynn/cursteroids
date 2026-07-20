export const SHIP_RADIUS = 18;
export const BULLET_SPEED = 520;
export const BULLET_LIFE = 1.05;
export const SHOT_COOLDOWN = 0.18;
export const START_WIDTH = 960;
export const START_HEIGHT = 600;
export const SHIP_LOGO_SIZE = SHIP_RADIUS * 1.6;
export const CURSOR_TIP_OFFSET = {
  x: (25.63 - 16) * (SHIP_LOGO_SIZE / 32),
  y: (11.63 - 16) * (SHIP_LOGO_SIZE / 32),
};
export const CURSOR_TIP_ANGLE = Math.atan2(CURSOR_TIP_OFFSET.y, CURSOR_TIP_OFFSET.x);
export const TWOPI = Math.PI * 2;
export const CAMPAIGN_PHASES = 4;
export const POWERUP_DROP_CHANCE = 0.28;
export const POWERUP_DURATION = 6.5;
export const POWERUP_RADIUS = 16;
export const REGEN_WINDOW = 2.4;
export const DRAIN_RADIUS = 110;
export const DRAIN_PER_SECOND = 18;
export const NEAR_MISS_GAP = 28;
/** Route prefix for the multi-zone deployment under mlynn.org/cursteroids.
 * Must match `basePath` in next.config.ts. next/link prefixes this
 * automatically; hand-built URLs (fetch calls, share links) must not. */
export const BASE_PATH = "/cursteroids";
export const CAREERS_URL = "https://cursor.com/careers/ai-adoption-engineer";
export const REPO_URL = "https://github.com/mrlynn/cursteroids";
export const APPLY_WITH_CHALLENGE_HINT =
  "Include your Cursteroids artifact PR or Loom link in the application.";

// --- Trust economy ---
export const TRUST_MAX = 100;
export const TRUST_START = 100;
export const TRUST_HIT_PENALTY = 35;
export const TRUST_OVERCLAIM_PENALTY = 4;
export const TRUST_CONVERT_BONUS = 12;
export const TRUST_PHASE_CLEAR_BONUS = 15;
export const MISS_STREAK_THRESHOLD = 6;

// --- Tab-fire (signature mechanic) ---
export const TAB_FIRE_COOLDOWN = 0.35;
export const TAB_CONE_HALF_ANGLE = Math.PI / 3.4; // ~53 degrees, generous forward cone
export const TAB_CONE_HALF_ANGLE_WIDE = Math.PI / 1.9; // widened by MCP boost / modifier
export const TAB_TRACER_LIFE = 0.16;

// --- Blocker conversion (pairing) ---
export const PAIRING_RADIUS = 80;
export const PAIRING_TIME = 2.5;
export const PAIRING_DECAY_RATE = 0.35;
export const CONVERTED_DURATION = 8;
export const CONVERTED_SPEED = 150;

// --- Agent deployable ---
export const AGENT_MAX_CHARGES = 2;
export const AGENT_DEPLOY_DURATION = 6;
export const AGENT_MAX_KILLS = 3;
export const AGENT_SPEED = 260;
export const AGENT_CHORE_RADIUS = 40;
export const AGENT_CHORE_PATTERN = /CI|docs|flaky|onboarding/i;

// --- Juice ---
export const HIT_STOP_DURATION = 0.06;
export const HIT_STOP_TIMESCALE = 0.12;
export const WAVE_INTRO_DURATION = 2;
export const LARGE_BLOCKER_RADIUS = 50;
