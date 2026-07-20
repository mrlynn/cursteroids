import { AGENT_MAX_CHARGES, POWERUP_DURATION } from "@/game/constants";
import type { ActiveEffects, GameState, PowerupKind, PowerupPickup, Vector } from "@/game/types";

export const POWERUP_KINDS: PowerupKind[] = ["Rules", "MCP", "Cloud Agent", "Dashboard"];

export const POWERUP_COPY: Record<PowerupKind, { short: string; teach: string }> = {
  Rules: {
    short: "Permanently pre-weakens your most common blocker label",
    teach: "Rules libraries encode team conventions so adoption sticks beyond the room.",
  },
  MCP: {
    short: "Wider hit radius + wider Tab suggestion cone, timed",
    teach: "MCP connects Cursor to the business — knowledge bases, JIRA, internal systems.",
  },
  "Cloud Agent": {
    short: "Banks a deploy charge — press E to send a chore-clearing drone",
    teach: "Cloud Agent workflows hand off automated jobs documented and running.",
  },
  Dashboard: {
    short: "Pause ROI drain while active",
    teach: "Adoption dashboards ground the leadership story in data, not sentiment.",
  },
};

export function emptyEffects(): ActiveEffects {
  return {
    mcpUntil: 0,
    dashboardUntil: 0,
    agentCharges: 0,
    rulesCoverage: {},
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

/** Finds the most common blocker label currently on screen, for Rules coverage. */
function mostCommonLabel(game: GameState): string | null {
  const counts = new Map<string, number>();
  for (const asteroid of game.asteroids) {
    counts.set(asteroid.label, (counts.get(asteroid.label) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [label, count] of counts) {
    if (count > bestCount) {
      best = label;
      bestCount = count;
    }
  }
  return best;
}

export function applyPowerup(game: GameState, kind: PowerupKind, now: number) {
  game.powerupsCollected += 1;

  switch (kind) {
    case "Rules": {
      const label = mostCommonLabel(game);
      if (label) {
        const alreadyCovered = Boolean(game.effects.rulesCoverage[label]);
        game.effects.rulesCoverage[label] = true;
        game.toast = `Rules shipped: "${label}" now spawns pre-weakened.`;
        if (!alreadyCovered) {
          game.powerupsUsedWell += 1;
        }
      } else {
        game.toast = `Rules: ${POWERUP_COPY.Rules.short}`;
      }
      game.toastUntil = now + 2.6;
      break;
    }
    case "MCP": {
      game.effects.mcpUntil = now + POWERUP_DURATION;
      game.toast = `MCP: ${POWERUP_COPY.MCP.short}`;
      game.toastUntil = now + 2.4;
      if (game.asteroids.some((asteroid) => asteroid.label.includes("context"))) {
        game.powerupsUsedWell += 1;
      }
      break;
    }
    case "Cloud Agent": {
      game.effects.agentCharges = Math.min(AGENT_MAX_CHARGES, game.effects.agentCharges + 1);
      game.toast = `Cloud Agent charge banked (${game.effects.agentCharges}/${AGENT_MAX_CHARGES}). Press E to deploy.`;
      game.toastUntil = now + 2.6;
      game.powerupsUsedWell += 1;
      break;
    }
    case "Dashboard": {
      game.effects.dashboardUntil = now + POWERUP_DURATION;
      game.toast = `Dashboard: ${POWERUP_COPY.Dashboard.short}`;
      game.toastUntil = now + 2.4;
      if (game.asteroids.some((asteroid) => asteroid.mechanic === "drain")) {
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
  if (now < effects.mcpUntil) {
    active.push("MCP");
  }
  if (now < effects.dashboardUntil) {
    active.push("Dashboard");
  }
  if (effects.agentCharges > 0) {
    active.push(`Agent x${effects.agentCharges}`);
  }
  return active.length > 0 ? active.join(" · ") : null;
}

export function hasMcpBoost(effects: ActiveEffects, now: number) {
  return now < effects.mcpUntil;
}

export function hasDashboard(effects: ActiveEffects, now: number) {
  return now < effects.dashboardUntil;
}
