import { getBlocker, getBlockerByLabel, hitPointsForMechanic } from "@/game/blockers";
import { waveBriefForLevel, isFinalPhase } from "@/game/campaign";
import {
  BULLET_LIFE,
  BULLET_SPEED,
  CAMPAIGN_PHASES,
  CURSOR_TIP_ANGLE,
  CURSOR_TIP_OFFSET,
  DRAIN_PER_SECOND,
  DRAIN_RADIUS,
  INITIAL_LIVES,
  NEAR_MISS_GAP,
  POWERUP_DROP_CHANCE,
  POWERUP_RADIUS,
  REGEN_WINDOW,
  SHIP_LOGO_SIZE,
  SHIP_RADIUS,
  SHOT_COOLDOWN,
  START_HEIGHT,
  START_WIDTH,
  TAB_SHOT_COOLDOWN,
  TWOPI,
} from "@/game/constants";
import { distance, randomBetween, rotateVector, wrapPosition } from "@/game/math";
import {
  activePowerupLabel,
  applyPowerup,
  createPowerup,
  emptyEffects,
  hasAgentAssist,
  hasRulesShield,
  hasTabBoost,
  POWERUP_KINDS,
} from "@/game/powerups";
import type {
  Asteroid,
  Bullet,
  GameSnapshot,
  GameState,
  Ship,
  Vector,
} from "@/game/types";

export type GamePalette = {
  ink: string;
  muted: string;
  line: string;
  panel: string;
  accent: string;
  accentSoft: string;
  danger: string;
  backgroundStart: string;
  backgroundMiddle: string;
  backgroundEnd: string;
  grid: string;
  dust: string;
  asteroidFill: string;
  overlay: string;
  frameBackground: string;
  powerup: string;
  shield: string;
};

export const gamePalettes: Record<"light" | "dark", GamePalette> = {
  light: {
    ink: "#1f1f1f",
    muted: "#777777",
    line: "rgba(31, 31, 31, 0.72)",
    panel: "rgba(255, 255, 255, 0.86)",
    accent: "#111111",
    accentSoft: "rgba(17, 17, 17, 0.1)",
    danger: "#ef4444",
    backgroundStart: "#ffffff",
    backgroundMiddle: "#fafafa",
    backgroundEnd: "#f3f3f1",
    grid: "rgba(0, 0, 0, 0.045)",
    dust: "rgba(0, 0, 0, 0.08)",
    asteroidFill: "rgba(255, 255, 255, 0.34)",
    overlay: "rgba(255, 255, 255, 0.72)",
    frameBackground: "#ffffff",
    powerup: "#0f766e",
    shield: "rgba(15, 118, 110, 0.35)",
  },
  dark: {
    ink: "#f4f4f0",
    muted: "#a8a8a0",
    line: "rgba(244, 244, 240, 0.7)",
    panel: "rgba(30, 30, 27, 0.9)",
    accent: "#f4f4f0",
    accentSoft: "rgba(244, 244, 240, 0.12)",
    danger: "#f87171",
    backgroundStart: "#11110f",
    backgroundMiddle: "#171714",
    backgroundEnd: "#22221e",
    grid: "rgba(255, 255, 255, 0.055)",
    dust: "rgba(255, 255, 255, 0.1)",
    asteroidFill: "rgba(255, 255, 255, 0.04)",
    overlay: "rgba(21, 21, 19, 0.76)",
    frameBackground: "#11110f",
    powerup: "#2dd4bf",
    shield: "rgba(45, 212, 191, 0.28)",
  },
};

let palette = gamePalettes.light;

export function setPalette(mode: "light" | "dark") {
  palette = gamePalettes[mode];
}

export function getPalette() {
  return palette;
}

function createShip(width: number, height: number): Ship {
  return {
    position: { x: width / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    angle: -Math.PI / 2,
    radius: SHIP_RADIUS,
  };
}

export function createInitialGame(): GameState {
  return {
    width: START_WIDTH,
    height: START_HEIGHT,
    status: "ready",
    ship: createShip(START_WIDTH, START_HEIGHT),
    asteroids: [],
    bullets: [],
    particles: [],
    powerups: [],
    effects: emptyEffects(),
    keys: new Set<string>(),
    score: 0,
    highScore: 0,
    lives: INITIAL_LIVES,
    level: 1,
    shots: 0,
    hits: 0,
    nearMisses: 0,
    blockersCleared: {},
    powerupsCollected: 0,
    powerupsUsedWell: 0,
    lastShotAt: 0,
    invincibleUntil: 0,
    nextAsteroidId: 1,
    nextPowerupId: 1,
    snapshotTimer: 0,
    toast: null,
    toastUntil: 0,
  };
}

export function getSnapshot(game: GameState, now = 0): GameSnapshot {
  return {
    status: game.status,
    score: game.score,
    highScore: game.highScore,
    lives: game.lives,
    level: game.level,
    asteroids: game.asteroids.length,
    accuracy: game.shots === 0 ? 100 : Math.round((game.hits / game.shots) * 100),
    nearMisses: game.nearMisses,
    blockersCleared: { ...game.blockersCleared },
    powerupsCollected: game.powerupsCollected,
    powerupsUsedWell: game.powerupsUsedWell,
    activePowerup: activePowerupLabel(game.effects, now),
    toast: now < game.toastUntil ? game.toast : null,
  };
}

function getCursorTipPosition(ship: Ship): Vector {
  const tipOffset = rotateVector(CURSOR_TIP_OFFSET, ship.angle - CURSOR_TIP_ANGLE);
  return {
    x: ship.position.x + tipOffset.x,
    y: ship.position.y + tipOffset.y,
  };
}

function createAsteroid(
  game: GameState,
  radius: number,
  position?: Vector,
  label?: string,
): Asteroid {
  const edge = Math.floor(Math.random() * 4);
  const spawnPosition =
    position ??
    (edge === 0
      ? { x: randomBetween(0, game.width), y: -radius }
      : edge === 1
        ? { x: game.width + radius, y: randomBetween(0, game.height) }
        : edge === 2
          ? { x: randomBetween(0, game.width), y: game.height + radius }
          : { x: -radius, y: randomBetween(0, game.height) });

  const blocker = label ? getBlockerByLabel(label) : getBlocker(game.nextAsteroidId + game.level);
  const resolvedLabel = label ?? blocker?.label ?? "context chaos";
  const mechanic = blocker?.mechanic ?? "none";
  const hitPoints = hitPointsForMechanic(mechanic);
  const speedBoost = mechanic === "drain" ? 18 : 0;
  const speed = randomBetween(28, 76) + game.level * 5 + speedBoost;
  const angle = randomBetween(0, TWOPI);
  const vertexCount = Math.floor(randomBetween(9, 14));

  return {
    id: game.nextAsteroidId++,
    position: { ...spawnPosition },
    velocity: {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    },
    radius,
    label: resolvedLabel,
    points: Array.from({ length: vertexCount }, () => randomBetween(0.72, 1.22)),
    rotation: randomBetween(0, TWOPI),
    spin: randomBetween(-0.8, 0.8),
    mechanic,
    hitPoints,
    maxHitPoints: hitPoints,
    firstHitAt: 0,
    cracked: false,
  };
}

export function spawnWave(game: GameState) {
  const count = Math.min(4 + game.level, 9);
  const wave: Asteroid[] = [];

  // Guarantee distinctive blockers appear in the campaign.
  const featured =
    game.level === 1
      ? "low trust in AI"
      : game.level === 2
        ? "no evals"
        : game.level === 3
          ? "unclear ROI"
          : null;

  if (featured) {
    wave.push(createAsteroid(game, randomBetween(44, 62), undefined, featured));
  }

  while (wave.length < count) {
    wave.push(createAsteroid(game, randomBetween(38, 62)));
  }

  game.asteroids = wave;
}

export function resetShip(game: GameState, now: number) {
  game.ship = createShip(game.width, game.height);
  game.invincibleUntil = now + 2.2;
}

function emitParticles(
  game: GameState,
  position: Vector,
  count: number,
  color: string,
  speed = 120,
) {
  for (let index = 0; index < count; index += 1) {
    const angle = randomBetween(0, TWOPI);
    const velocity = randomBetween(speed * 0.25, speed);
    game.particles.push({
      position: { ...position },
      velocity: {
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
      },
      life: randomBetween(0.28, 0.8),
      color,
    });
  }
}

function maybeDropPowerup(game: GameState, position: Vector) {
  if (Math.random() > POWERUP_DROP_CHANCE) {
    return;
  }
  const kind = POWERUP_KINDS[Math.floor(Math.random() * POWERUP_KINDS.length)];
  game.powerups.push(createPowerup(game, kind, position));
}

function recordClear(game: GameState, label: string) {
  game.blockersCleared[label] = (game.blockersCleared[label] ?? 0) + 1;
}

function destroyAsteroid(game: GameState, asteroid: Asteroid, spawnedAsteroids: Asteroid[]) {
  game.hits += 1;
  const bonus =
    asteroid.mechanic === "armored" ? 40 : asteroid.mechanic === "regen" ? 55 : asteroid.mechanic === "drain" ? 70 : 0;
  game.score += Math.round((80 - asteroid.radius) * 5 + game.level * 25 + bonus);
  game.highScore = Math.max(game.highScore, game.score);
  emitParticles(game, asteroid.position, 18, palette.accent, 190);
  recordClear(game, asteroid.label);
  maybeDropPowerup(game, asteroid.position);

  if (asteroid.radius > 26) {
    const blocker = getBlockerByLabel(asteroid.label);
    const fragments = blocker?.fragments ?? ["workflow gap", "missing owner"];
    spawnedAsteroids.push(
      createAsteroid(game, asteroid.radius * 0.58, asteroid.position, fragments[0]),
      createAsteroid(game, asteroid.radius * 0.5, asteroid.position, fragments[1]),
    );
  }
}

function fireBullet(game: GameState, now: number) {
  const cooldown = hasTabBoost(game.effects, now) ? TAB_SHOT_COOLDOWN : SHOT_COOLDOWN;
  if (now - game.lastShotAt < cooldown) {
    return;
  }

  game.lastShotAt = now;
  game.shots += 1;

  const nose = getCursorTipPosition(game.ship);
  nose.x += Math.cos(game.ship.angle) * 4;
  nose.y += Math.sin(game.ship.angle) * 4;

  let angle = game.ship.angle;
  if (hasAgentAssist(game.effects, now) && game.asteroids.length > 0) {
    let nearest = game.asteroids[0];
    let nearestDist = distance(game.ship.position, nearest.position);
    for (const asteroid of game.asteroids) {
      const dist = distance(game.ship.position, asteroid.position);
      const weight = asteroid.mechanic !== "none" ? 0.82 : 1;
      const scored = dist * weight;
      if (scored < nearestDist) {
        nearest = asteroid;
        nearestDist = scored;
      }
    }
    angle = Math.atan2(
      nearest.position.y - game.ship.position.y,
      nearest.position.x - game.ship.position.x,
    );
  }

  game.bullets.push({
    position: nose,
    velocity: {
      x: game.ship.velocity.x + Math.cos(angle) * BULLET_SPEED,
      y: game.ship.velocity.y + Math.sin(angle) * BULLET_SPEED,
    },
    life: BULLET_LIFE,
  });
}

function applyAgentSteering(game: GameState, delta: number, now: number) {
  if (!hasAgentAssist(game.effects, now) || game.asteroids.length === 0) {
    return;
  }

  let nearest = game.asteroids[0];
  let nearestDist = Infinity;
  for (const asteroid of game.asteroids) {
    const dist = distance(game.ship.position, asteroid.position);
    const weight = asteroid.mechanic !== "none" ? 0.75 : 1;
    if (dist * weight < nearestDist) {
      nearest = asteroid;
      nearestDist = dist * weight;
    }
  }

  const desired = Math.atan2(
    nearest.position.y - game.ship.position.y,
    nearest.position.x - game.ship.position.x,
  );
  let diff = desired - game.ship.angle;
  while (diff > Math.PI) diff -= TWOPI;
  while (diff < -Math.PI) diff += TWOPI;
  game.ship.angle += Math.max(-2.8, Math.min(2.8, diff)) * delta * 1.6;
}

export function updatePlaying(game: GameState, delta: number, now: number) {
  const ship = game.ship;
  const turn = 4.9;
  const thrust = 430;

  if (now >= game.toastUntil) {
    game.toast = null;
  }

  applyAgentSteering(game, delta, now);

  if (game.keys.has("ArrowLeft") || game.keys.has("KeyA")) {
    ship.angle -= turn * delta;
  }
  if (game.keys.has("ArrowRight") || game.keys.has("KeyD")) {
    ship.angle += turn * delta;
  }
  if (game.keys.has("ArrowUp") || game.keys.has("KeyW")) {
    ship.velocity.x += Math.cos(ship.angle) * thrust * delta;
    ship.velocity.y += Math.sin(ship.angle) * thrust * delta;
    emitParticles(
      game,
      {
        x: ship.position.x - Math.cos(ship.angle) * ship.radius,
        y: ship.position.y - Math.sin(ship.angle) * ship.radius,
      },
      1,
      palette.accent,
      80,
    );
  }
  if (game.keys.has("Space")) {
    fireBullet(game, now);
  }

  ship.velocity.x *= 0.992;
  ship.velocity.y *= 0.992;
  ship.position.x += ship.velocity.x * delta;
  ship.position.y += ship.velocity.y * delta;
  wrapPosition(ship.position, game.width, game.height, ship.radius);

  game.bullets = game.bullets
    .map((bullet) => ({
      ...bullet,
      life: bullet.life - delta,
      position: {
        x: bullet.position.x + bullet.velocity.x * delta,
        y: bullet.position.y + bullet.velocity.y * delta,
      },
    }))
    .filter((bullet) => bullet.life > 0);

  for (const bullet of game.bullets) {
    wrapPosition(bullet.position, game.width, game.height);
  }

  for (const asteroid of game.asteroids) {
    asteroid.position.x += asteroid.velocity.x * delta;
    asteroid.position.y += asteroid.velocity.y * delta;
    asteroid.rotation += asteroid.spin * delta;
    wrapPosition(asteroid.position, game.width, game.height, asteroid.radius);

    if (asteroid.mechanic === "regen" && asteroid.cracked && asteroid.firstHitAt > 0) {
      if (now - asteroid.firstHitAt > REGEN_WINDOW) {
        asteroid.hitPoints = asteroid.maxHitPoints;
        asteroid.cracked = false;
        asteroid.firstHitAt = 0;
        emitParticles(game, asteroid.position, 8, palette.muted, 70);
      }
    }

    if (asteroid.mechanic === "drain") {
      const dist = distance(ship.position, asteroid.position);
      if (dist < DRAIN_RADIUS) {
        const falloff = 1 - dist / DRAIN_RADIUS;
        game.score = Math.max(0, game.score - DRAIN_PER_SECOND * falloff * delta);
      }
    }
  }

  game.powerups = game.powerups
    .map((powerup) => ({
      ...powerup,
      life: powerup.life - delta,
      position: {
        x: powerup.position.x + powerup.velocity.x * delta,
        y: powerup.position.y + powerup.velocity.y * delta,
      },
    }))
    .filter((powerup) => powerup.life > 0);

  for (const powerup of game.powerups) {
    wrapPosition(powerup.position, game.width, game.height, powerup.radius);
    powerup.velocity.x *= 0.995;
    powerup.velocity.y *= 0.995;
  }

  const remainingPowerups: typeof game.powerups = [];
  for (const powerup of game.powerups) {
    if (distance(ship.position, powerup.position) < ship.radius + powerup.radius) {
      applyPowerup(game, powerup.kind, now);
      emitParticles(game, powerup.position, 12, palette.powerup, 140);
    } else {
      remainingPowerups.push(powerup);
    }
  }
  game.powerups = remainingPowerups;

  const destroyedBullets = new Set<Bullet>();
  const destroyedAsteroids = new Set<Asteroid>();
  const spawnedAsteroids: Asteroid[] = [];

  for (const bullet of game.bullets) {
    for (const asteroid of game.asteroids) {
      if (destroyedAsteroids.has(asteroid)) {
        continue;
      }

      if (distance(bullet.position, asteroid.position) < asteroid.radius) {
        destroyedBullets.add(bullet);

        if (asteroid.mechanic === "armored" && asteroid.hitPoints > 1) {
          asteroid.hitPoints -= 1;
          asteroid.cracked = true;
          asteroid.firstHitAt = now;
          emitParticles(game, asteroid.position, 10, palette.muted, 120);
          game.hits += 1;
          break;
        }

        if (asteroid.mechanic === "regen" && !asteroid.cracked) {
          asteroid.cracked = true;
          asteroid.firstHitAt = now;
          asteroid.hitPoints = 0;
          emitParticles(game, asteroid.position, 10, palette.danger, 120);
          game.hits += 1;
          // First hit only cracks; second hit in window destroys.
          break;
        }

        if (asteroid.mechanic === "regen" && asteroid.cracked) {
          destroyedAsteroids.add(asteroid);
          destroyAsteroid(game, asteroid, spawnedAsteroids);
          break;
        }

        destroyedAsteroids.add(asteroid);
        destroyAsteroid(game, asteroid, spawnedAsteroids);
        break;
      }
    }
  }

  game.bullets = game.bullets.filter((bullet) => !destroyedBullets.has(bullet));
  game.asteroids = game.asteroids
    .filter((asteroid) => !destroyedAsteroids.has(asteroid))
    .concat(spawnedAsteroids);

  // Approximate near-misses for the trust dimension (close passes that did not hit).
  if (now > game.invincibleUntil && !hasRulesShield(game.effects, now)) {
    for (const asteroid of game.asteroids) {
      const dist = distance(ship.position, asteroid.position);
      const hitRadius = ship.radius + asteroid.radius * 0.82;
      if (dist > hitRadius && dist < hitRadius + NEAR_MISS_GAP && Math.random() < delta * 1.8) {
        game.nearMisses += 1;
      }
    }
  }

  const shielded = hasRulesShield(game.effects, now);
  if (now > game.invincibleUntil) {
    const shipHit = game.asteroids.some(
      (asteroid) => distance(ship.position, asteroid.position) < ship.radius + asteroid.radius * 0.82,
    );

    if (shipHit) {
      if (shielded) {
        emitParticles(game, ship.position, 16, palette.powerup, 160);
        game.effects.rulesUntil = Math.min(game.effects.rulesUntil, now + 0.15);
        game.invincibleUntil = now + 1.1;
        game.powerupsUsedWell += 1;
      } else {
        emitParticles(game, ship.position, 34, palette.danger, 220);
        game.lives -= 1;
        game.bullets = [];

        if (game.lives <= 0) {
          game.status = "gameOver";
        } else {
          resetShip(game, now);
        }
      }
    }
  }

  if (game.status === "playing" && game.asteroids.length === 0) {
    if (isFinalPhase(game.level)) {
      game.status = "missionComplete";
      game.toast = "Mission complete. Prove it in the builder challenge.";
      game.toastUntil = now + 4;
      return;
    }

    game.level += 1;
    resetShip(game, now);
    spawnWave(game);
    game.toast = waveBriefForLevel(game.level);
    game.toastUntil = now + 2.2;
  }
}

export function updateParticles(game: GameState, delta: number) {
  game.particles = game.particles
    .map((particle) => ({
      ...particle,
      life: particle.life - delta,
      position: {
        x: particle.position.x + particle.velocity.x * delta,
        y: particle.position.y + particle.velocity.y * delta,
      },
      velocity: {
        x: particle.velocity.x * 0.98,
        y: particle.velocity.y * 0.98,
      },
    }))
    .filter((particle) => particle.life > 0);
}

function drawCursorLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const scale = size / 32;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.translate(-16, -16);
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(16, 2.35);
  ctx.bezierCurveTo(16.66, 2.35, 17.3, 2.52, 17.88, 2.85);
  ctx.lineTo(27.22, 8.24);
  ctx.bezierCurveTo(28.38, 8.91, 29.1, 10.16, 29.1, 11.5);
  ctx.lineTo(29.1, 20.5);
  ctx.bezierCurveTo(29.1, 21.84, 28.38, 23.09, 27.22, 23.76);
  ctx.lineTo(17.88, 29.15);
  ctx.bezierCurveTo(16.72, 29.82, 15.28, 29.82, 14.12, 29.15);
  ctx.lineTo(4.78, 23.76);
  ctx.bezierCurveTo(3.62, 23.09, 2.9, 21.84, 2.9, 20.5);
  ctx.lineTo(2.9, 11.5);
  ctx.bezierCurveTo(2.9, 10.16, 3.62, 8.91, 4.78, 8.24);
  ctx.lineTo(14.12, 2.85);
  ctx.bezierCurveTo(14.7, 2.52, 15.34, 2.35, 16, 2.35);
  ctx.closePath();
  const shellGradient = ctx.createLinearGradient(3, 5, 29, 28);
  shellGradient.addColorStop(0, "#5b5b55");
  shellGradient.addColorStop(0.5, "#171713");
  shellGradient.addColorStop(1, "#77776f");
  ctx.fillStyle = shellGradient;
  ctx.fill();
  ctx.save();
  ctx.clip();

  ctx.beginPath();
  ctx.moveTo(16, 2.8);
  ctx.lineTo(27.95, 9.7);
  ctx.lineTo(16, 9.7);
  ctx.closePath();
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = "#171713";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(3.25, 20.55);
  ctx.lineTo(3.25, 11.3);
  ctx.lineTo(16, 9.7);
  ctx.lineTo(16, 29.25);
  ctx.closePath();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#5c5c55";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(28.75, 20.55);
  ctx.lineTo(28.75, 11.3);
  ctx.lineTo(16, 9.7);
  ctx.lineTo(16, 29.25);
  ctx.closePath();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "#12120f";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(7.02, 10.06);
  ctx.lineTo(24.98, 10.06);
  ctx.bezierCurveTo(25.81, 10.06, 26.22, 11.05, 25.63, 11.63);
  ctx.lineTo(16.5, 27.04);
  ctx.bezierCurveTo(16.05, 27.8, 14.88, 27.48, 14.88, 26.59);
  ctx.lineTo(14.88, 16.77);
  ctx.lineTo(6.48, 11.7);
  ctx.bezierCurveTo(5.7, 11.23, 6.11, 10.06, 7.02, 10.06);
  ctx.closePath();
  const planeGradient = ctx.createLinearGradient(7, 9, 26, 27);
  planeGradient.addColorStop(0, "#ffffff");
  planeGradient.addColorStop(0.56, "#f4f4f3");
  planeGradient.addColorStop(1, "#c8c8c5");
  ctx.fillStyle = planeGradient;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(15.05, 16.75);
  ctx.lineTo(25.63, 10.67);
  ctx.lineTo(16.5, 27.04);
  ctx.bezierCurveTo(16.05, 27.8, 14.88, 27.48, 14.88, 26.59);
  ctx.lineTo(14.88, 16.77);
  ctx.closePath();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#d5d5d2";
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawShip(ctx: CanvasRenderingContext2D, game: GameState, now: number) {
  const { ship } = game;
  const isInvincible = now < game.invincibleUntil;

  if (isInvincible && Math.floor(now * 10) % 2 === 0) {
    return;
  }

  if (hasRulesShield(game.effects, now)) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ship.position.x, ship.position.y, ship.radius + 10, 0, TWOPI);
    ctx.strokeStyle = palette.powerup;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.fillStyle = palette.shield;
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(ship.position.x, ship.position.y);
  ctx.rotate(ship.angle - CURSOR_TIP_ANGLE);
  drawCursorLogo(ctx, 0, 0, SHIP_LOGO_SIZE);
  ctx.restore();

  if (game.keys.has("ArrowUp") || game.keys.has("KeyW")) {
    ctx.save();
    ctx.translate(ship.position.x, ship.position.y);
    ctx.rotate(ship.angle);
    ctx.beginPath();
    ctx.moveTo(-ship.radius * 0.8, 0);
    ctx.lineTo(-ship.radius * 1.55, -6);
    ctx.lineTo(-ship.radius * 1.55, 6);
    ctx.closePath();
    ctx.fillStyle = palette.accentSoft;
    ctx.fill();
    ctx.restore();
  }
}

function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid, now: number) {
  ctx.save();
  ctx.translate(asteroid.position.x, asteroid.position.y);
  ctx.rotate(asteroid.rotation);
  ctx.beginPath();

  asteroid.points.forEach((scale, index) => {
    const angle = (index / asteroid.points.length) * TWOPI;
    const radius = asteroid.radius * scale;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();

  if (asteroid.mechanic === "drain") {
    ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
    ctx.strokeStyle = palette.danger;
  } else if (asteroid.mechanic === "regen" && asteroid.cracked) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.16)";
    ctx.strokeStyle = "#d97706";
  } else if (asteroid.mechanic === "armored" && asteroid.cracked) {
    ctx.fillStyle = "rgba(15, 118, 110, 0.12)";
    ctx.strokeStyle = palette.powerup;
  } else {
    ctx.fillStyle = palette.asteroidFill;
    ctx.strokeStyle = palette.line;
  }

  ctx.lineWidth = asteroid.mechanic !== "none" ? 2.4 : 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  if (asteroid.mechanic === "drain") {
    ctx.save();
    ctx.beginPath();
    ctx.arc(asteroid.position.x, asteroid.position.y, DRAIN_RADIUS, 0, TWOPI);
    ctx.strokeStyle = palette.danger;
    ctx.globalAlpha = 0.12 + (Math.sin(now * 4) + 1) * 0.04;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  if (asteroid.mechanic === "regen" && asteroid.cracked && asteroid.firstHitAt > 0) {
    const remaining = Math.max(0, REGEN_WINDOW - (now - asteroid.firstHitAt));
    ctx.save();
    ctx.strokeStyle = "#d97706";
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      asteroid.position.x,
      asteroid.position.y,
      asteroid.radius + 6,
      -Math.PI / 2,
      -Math.PI / 2 + (remaining / REGEN_WINDOW) * TWOPI,
    );
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = palette.ink;
  ctx.globalAlpha = 0.78;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.max(9, Math.min(13, asteroid.radius * 0.24))}px var(--font-geist-sans), Arial, sans-serif`;
  const words = asteroid.label.split(" ");
  const lines = words.length > 2 ? [words.slice(0, -1).join(" "), words.at(-1) ?? ""] : [asteroid.label];
  lines.forEach((line, index) => {
    ctx.fillText(line, asteroid.position.x, asteroid.position.y + (index - (lines.length - 1) / 2) * 12);
  });
  ctx.restore();
}

function drawPowerup(ctx: CanvasRenderingContext2D, powerup: GameState["powerups"][number], now: number) {
  ctx.save();
  const pulse = 1 + Math.sin(now * 6 + powerup.id) * 0.08;
  ctx.translate(powerup.position.x, powerup.position.y);
  ctx.beginPath();
  ctx.arc(0, 0, POWERUP_RADIUS * pulse, 0, TWOPI);
  ctx.fillStyle = palette.panel;
  ctx.strokeStyle = palette.powerup;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = palette.powerup;
  ctx.font = "700 9px var(--font-geist-sans), Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = powerup.kind === "Agent Mode" ? "Agent" : powerup.kind;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, game: GameState) {
  ctx.clearRect(0, 0, game.width, game.height);

  const gradient = ctx.createLinearGradient(0, 0, game.width, game.height);
  gradient.addColorStop(0, palette.backgroundStart);
  gradient.addColorStop(0.52, palette.backgroundMiddle);
  gradient.addColorStop(1, palette.backgroundEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, game.width, game.height);

  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  const grid = 44;
  for (let x = 0; x < game.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, game.height);
    ctx.stroke();
  }
  for (let y = 0; y < game.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(game.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = palette.dust;
  for (let index = 0; index < 36; index += 1) {
    const x = (index * 151) % game.width;
    const y = (index * 89) % game.height;
    ctx.beginPath();
    ctx.arc(x, y, index % 5 === 0 ? 2.4 : 1.4, 0, TWOPI);
    ctx.fill();
  }
}

function drawHud(ctx: CanvasRenderingContext2D, game: GameState, now: number) {
  ctx.save();
  ctx.fillStyle = palette.ink;
  ctx.font = "700 13px var(--font-geist-mono), monospace";
  ctx.fillText(`IMPACT ${Math.max(0, Math.round(game.score)).toString().padStart(5, "0")}`, 22, 30);
  ctx.fillText(`TRUST ${game.lives}`, 22, 52);
  ctx.textAlign = "right";
  ctx.fillText(`PHASE ${Math.min(game.level, CAMPAIGN_PHASES)}/${CAMPAIGN_PHASES}`, game.width - 22, 30);
  ctx.font = "600 12px var(--font-geist-sans), Arial, sans-serif";
  ctx.fillText(waveBriefForLevel(game.level), game.width - 22, 52);

  const active = activePowerupLabel(game.effects, now);
  if (active) {
    ctx.textAlign = "left";
    ctx.fillStyle = palette.powerup;
    ctx.font = "700 12px var(--font-geist-sans), Arial, sans-serif";
    ctx.fillText(active, 22, game.height - 22);
  }

  if (game.toast && now < game.toastUntil) {
    ctx.textAlign = "center";
    ctx.fillStyle = palette.ink;
    ctx.font = "600 14px var(--font-geist-sans), Arial, sans-serif";
    ctx.globalAlpha = 0.9;
    ctx.fillText(game.toast, game.width / 2, 78);
  }

  ctx.restore();
}

function drawOverlay(ctx: CanvasRenderingContext2D, game: GameState) {
  if (game.status === "playing") {
    return;
  }

  const title =
    game.status === "ready"
      ? "Clear AI adoption blockers"
      : game.status === "paused"
        ? "Paused"
        : game.status === "missionComplete"
          ? "Mission complete"
          : "Run ended";
  const subtitle =
    game.status === "ready"
      ? "Four phases. Real powerups. Then prove it in the builder challenge."
      : game.status === "paused"
        ? "Press P or Resume to continue."
        : game.status === "missionComplete"
          ? "Fork one blocker and show how you would help a team adopt Cursor."
          : "Review your scorecard, then take the builder challenge.";

  ctx.save();
  ctx.fillStyle = palette.overlay;
  ctx.fillRect(0, 0, game.width, game.height);
  ctx.fillStyle = palette.ink;
  ctx.textAlign = "center";
  ctx.font = "800 34px var(--font-geist-sans), Arial, sans-serif";
  ctx.fillText(title, game.width / 2, game.height / 2 - 12);
  ctx.font = "500 16px var(--font-geist-sans), Arial, sans-serif";
  ctx.fillStyle = palette.muted;
  ctx.fillText(subtitle, game.width / 2, game.height / 2 + 22);
  ctx.restore();
}

export function drawGame(ctx: CanvasRenderingContext2D, game: GameState, now: number) {
  drawBackground(ctx, game);

  for (const particle of game.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.position.x, particle.position.y, 2.2, 0, TWOPI);
    ctx.fill();
    ctx.restore();
  }

  for (const bullet of game.bullets) {
    ctx.beginPath();
    ctx.arc(bullet.position.x, bullet.position.y, 3.4, 0, TWOPI);
    ctx.fillStyle = palette.accent;
    ctx.fill();
  }

  for (const asteroid of game.asteroids) {
    drawAsteroid(ctx, asteroid, now);
  }

  for (const powerup of game.powerups) {
    drawPowerup(ctx, powerup, now);
  }

  drawShip(ctx, game, now);
  drawHud(ctx, game, now);
  drawOverlay(ctx, game);
}

export function startMission(game: GameState, now: number) {
  game.status = "playing";
  game.score = 0;
  game.lives = INITIAL_LIVES;
  game.level = 1;
  game.shots = 0;
  game.hits = 0;
  game.nearMisses = 0;
  game.blockersCleared = {};
  game.powerupsCollected = 0;
  game.powerupsUsedWell = 0;
  game.bullets = [];
  game.particles = [];
  game.powerups = [];
  game.effects = emptyEffects();
  game.keys.clear();
  game.toast = waveBriefForLevel(1);
  game.toastUntil = now + 2.4;
  resetShip(game, now);
  spawnWave(game);
}

export { wrapPosition };
