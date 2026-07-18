import { POWERUP_DURATION } from "@/game/constants";
import type { ActiveEffects, GameState, PowerupKind, PowerupPickup, Vector } from "@/game/types";

export const POWERUP_KINDS: PowerupKind[] = ["Rules", "Tab", "Agent Mode"];

export const POWERUP_COPY: Record<PowerupKind, { short: string; teach: string }> = {
  Rules: {
    short: "Shield from constraint clarity",
    teach: "Rules encode the guardrails so teams stop negotiating every prompt.",
  },
  Tab: {
    short: "Faster fire / autocomplete rhythm",
    teach: "Tab keeps flow when the next step is obvious.",
  },
  "Agent Mode": {
    short: "Auto-assist toward nearest blocker",
    teach: "Agent Mode takes the repetitive path so you stay on the hard judgment calls.",
  },
};

export function emptyEffects(): ActiveEffects {
  return {
    rulesUntil: 0,
    tabUntil: 0,
    agentUntil: 0,
  };
}

export function createPowerup(
  game: GameState,
  kind: PowerupKind,
  position: Vector,
): PowerupPickup {
  const angle = Math.random() * Math.PI * 2;
  const speed = 40 + Math.random() * 36;

  return {
    id: game.nextPowerupId++,
    kind,
    position: { ...position },
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    life: 12,
    radius: 16,
  };
}

export function applyPowerup(game: GameState, kind: PowerupKind, now: number) {
  game.powerupsCollected += 1;
  game.toast = `${kind}: ${POWERUP_COPY[kind].short}`;
  game.toastUntil = now + 2.4;

  switch (kind) {
    case "Rules": {
      const wasLowTrust = game.lives <= 1 || now < game.invincibleUntil + 0.5;
      game.effects.rulesUntil = now + POWERUP_DURATION;
      if (wasLowTrust) {
        game.powerupsUsedWell += 1;
      }
      break;
    }
    case "Tab": {
      game.effects.tabUntil = now + POWERUP_DURATION;
      if (game.asteroids.length >= 4) {
        game.powerupsUsedWell += 1;
      }
      break;
    }
    case "Agent Mode": {
      game.effects.agentUntil = now + POWERUP_DURATION;
      if (game.asteroids.some((asteroid) => asteroid.mechanic !== "none")) {
        game.powerupsUsedWell += 1;
      }
      break;
    }
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function activePowerupLabel(effects: ActiveEffects, now: number): string | null {
  const active: string[] = [];
  if (now < effects.rulesUntil) {
    active.push("Rules");
  }
  if (now < effects.tabUntil) {
    active.push("Tab");
  }
  if (now < effects.agentUntil) {
    active.push("Agent Mode");
  }
  return active.length > 0 ? active.join(" · ") : null;
}

export function hasRulesShield(effects: ActiveEffects, now: number) {
  return now < effects.rulesUntil;
}

export function hasTabBoost(effects: ActiveEffects, now: number) {
  return now < effects.tabUntil;
}

export function hasAgentAssist(effects: ActiveEffects, now: number) {
  return now < effects.agentUntil;
}
