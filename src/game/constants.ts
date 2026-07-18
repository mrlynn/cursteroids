export const SHIP_RADIUS = 18;
export const BULLET_SPEED = 520;
export const BULLET_LIFE = 1.05;
export const SHOT_COOLDOWN = 0.18;
export const TAB_SHOT_COOLDOWN = 0.09;
export const INITIAL_LIVES = 3;
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
export const CAREERS_URL = "https://cursor.com/careers/ai-adoption-engineer";
export const REPO_URL = "https://github.com/mrlynn/cursteroids";
export const APPLY_WITH_CHALLENGE_HINT =
  "Include your Cursteroids PR or Loom link in the application.";
