"use client";

import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";

type Vector = {
  x: number;
  y: number;
};

type Ship = {
  position: Vector;
  velocity: Vector;
  angle: number;
  radius: number;
};

type Asteroid = {
  id: number;
  position: Vector;
  velocity: Vector;
  radius: number;
  points: number[];
  rotation: number;
  spin: number;
};

type Bullet = {
  position: Vector;
  velocity: Vector;
  life: number;
};

type Particle = {
  position: Vector;
  velocity: Vector;
  life: number;
  color: string;
};

type GameStatus = "ready" | "playing" | "paused" | "gameOver";

type GameState = {
  width: number;
  height: number;
  status: GameStatus;
  ship: Ship;
  asteroids: Asteroid[];
  bullets: Bullet[];
  particles: Particle[];
  keys: Set<string>;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  shots: number;
  hits: number;
  lastShotAt: number;
  invincibleUntil: number;
  nextAsteroidId: number;
  snapshotTimer: number;
};

type GameSnapshot = {
  status: GameStatus;
  score: number;
  highScore: number;
  lives: number;
  level: number;
  asteroids: number;
  accuracy: number;
};

const SHIP_RADIUS = 18;
const BULLET_SPEED = 520;
const BULLET_LIFE = 1.05;
const SHOT_COOLDOWN = 0.18;
const INITIAL_LIVES = 3;
const START_WIDTH = 960;
const START_HEIGHT = 600;
const SHIP_LOGO_SIZE = SHIP_RADIUS * 1.6;
const CURSOR_TIP_OFFSET = {
  x: (25.63 - 16) * (SHIP_LOGO_SIZE / 32),
  y: (11.63 - 16) * (SHIP_LOGO_SIZE / 32),
};
const CURSOR_TIP_ANGLE = Math.atan2(CURSOR_TIP_OFFSET.y, CURSOR_TIP_OFFSET.x);
const TWOPI = Math.PI * 2;

const gamePalettes = {
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
  },
};
let palette = gamePalettes.light;

function createShip(width: number, height: number): Ship {
  return {
    position: { x: width / 2, y: height / 2 },
    velocity: { x: 0, y: 0 },
    angle: -Math.PI / 2,
    radius: SHIP_RADIUS,
  };
}

function createInitialGame(): GameState {
  const ship = createShip(START_WIDTH, START_HEIGHT);

  return {
    width: START_WIDTH,
    height: START_HEIGHT,
    status: "ready",
    ship,
    asteroids: [],
    bullets: [],
    particles: [],
    keys: new Set<string>(),
    score: 0,
    highScore: 0,
    lives: INITIAL_LIVES,
    level: 1,
    shots: 0,
    hits: 0,
    lastShotAt: 0,
    invincibleUntil: 0,
    nextAsteroidId: 1,
    snapshotTimer: 0,
  };
}

function getSnapshot(game: GameState): GameSnapshot {
  return {
    status: game.status,
    score: game.score,
    highScore: game.highScore,
    lives: game.lives,
    level: game.level,
    asteroids: game.asteroids.length,
    accuracy: game.shots === 0 ? 100 : Math.round((game.hits / game.shots) * 100),
  };
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function distance(a: Vector, b: Vector) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function rotateVector(vector: Vector, angle: number): Vector {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
}

function getCursorTipPosition(ship: Ship): Vector {
  const tipOffset = rotateVector(CURSOR_TIP_OFFSET, ship.angle - CURSOR_TIP_ANGLE);

  return {
    x: ship.position.x + tipOffset.x,
    y: ship.position.y + tipOffset.y,
  };
}

function wrapPosition(position: Vector, width: number, height: number, margin = 0) {
  if (position.x < -margin) {
    position.x = width + margin;
  } else if (position.x > width + margin) {
    position.x = -margin;
  }

  if (position.y < -margin) {
    position.y = height + margin;
  } else if (position.y > height + margin) {
    position.y = -margin;
  }
}

function createAsteroid(game: GameState, radius: number, position?: Vector): Asteroid {
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

  const speed = randomBetween(28, 76) + game.level * 5;
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
    points: Array.from({ length: vertexCount }, () => randomBetween(0.72, 1.22)),
    rotation: randomBetween(0, TWOPI),
    spin: randomBetween(-0.8, 0.8),
  };
}

function spawnWave(game: GameState) {
  const count = Math.min(5 + game.level, 10);
  game.asteroids = Array.from({ length: count }, () =>
    createAsteroid(game, randomBetween(38, 62)),
  );
}

function resetShip(game: GameState, now: number) {
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

function fireBullet(game: GameState, now: number) {
  if (now - game.lastShotAt < SHOT_COOLDOWN) {
    return;
  }

  game.lastShotAt = now;
  game.shots += 1;

  const nose = getCursorTipPosition(game.ship);
  nose.x += Math.cos(game.ship.angle) * 4;
  nose.y += Math.sin(game.ship.angle) * 4;

  game.bullets.push({
    position: nose,
    velocity: {
      x: game.ship.velocity.x + Math.cos(game.ship.angle) * BULLET_SPEED,
      y: game.ship.velocity.y + Math.sin(game.ship.angle) * BULLET_SPEED,
    },
    life: BULLET_LIFE,
  });
}

function updatePlaying(game: GameState, delta: number, now: number) {
  const ship = game.ship;
  const turn = 4.9;
  const thrust = 430;

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
  }

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
        destroyedAsteroids.add(asteroid);
        game.hits += 1;
        game.score += Math.round((80 - asteroid.radius) * 5 + game.level * 25);
        game.highScore = Math.max(game.highScore, game.score);
        emitParticles(game, asteroid.position, 18, palette.accent, 190);

        if (asteroid.radius > 26) {
          spawnedAsteroids.push(
            createAsteroid(game, asteroid.radius * 0.58, asteroid.position),
            createAsteroid(game, asteroid.radius * 0.5, asteroid.position),
          );
        }
        break;
      }
    }
  }

  game.bullets = game.bullets.filter((bullet) => !destroyedBullets.has(bullet));
  game.asteroids = game.asteroids
    .filter((asteroid) => !destroyedAsteroids.has(asteroid))
    .concat(spawnedAsteroids);

  if (now > game.invincibleUntil) {
    const shipHit = game.asteroids.some(
      (asteroid) => distance(ship.position, asteroid.position) < ship.radius + asteroid.radius * 0.82,
    );

    if (shipHit) {
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

  if (game.status === "playing" && game.asteroids.length === 0) {
    game.level += 1;
    resetShip(game, now);
    spawnWave(game);
  }
}

function updateParticles(game: GameState, delta: number) {
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

function drawAsteroid(ctx: CanvasRenderingContext2D, asteroid: Asteroid) {
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
  ctx.fillStyle = palette.asteroidFill;
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
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

function drawHud(ctx: CanvasRenderingContext2D, game: GameState) {
  ctx.save();
  ctx.fillStyle = palette.ink;
  ctx.font = "700 13px var(--font-geist-mono), monospace";
  ctx.fillText(`SCORE ${game.score.toString().padStart(5, "0")}`, 22, 30);
  ctx.fillText(`LIVES ${game.lives}`, 22, 52);
  ctx.textAlign = "right";
  ctx.fillText(`WAVE ${game.level}`, game.width - 22, 30);
  ctx.restore();
}

function drawOverlay(ctx: CanvasRenderingContext2D, game: GameState) {
  if (game.status === "playing") {
    return;
  }

  const title =
    game.status === "ready"
      ? "Click Start Mission"
      : game.status === "paused"
        ? "Paused"
        : "Game Over";
  const subtitle =
    game.status === "ready"
      ? "Arrow keys or WASD to fly. Space to fire."
      : game.status === "paused"
        ? "Press P or Resume to continue."
        : "Restart to run it back.";

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

function drawGame(ctx: CanvasRenderingContext2D, game: GameState, now: number) {
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
    drawAsteroid(ctx, asteroid);
  }

  drawShip(ctx, game, now);
  drawHud(ctx, game);
  drawOverlay(ctx, game);
}

export function CursteroidsGame() {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const gameRef = useRef<GameState>(createInitialGame());
  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    status: "ready",
    score: 0,
    highScore: 0,
    lives: INITIAL_LIVES,
    level: 1,
    asteroids: 0,
    accuracy: 100,
  });

  const syncSnapshot = useCallback(() => {
    setSnapshot(getSnapshot(gameRef.current));
  }, []);

  const startGame = useCallback(() => {
    const game = gameRef.current;
    game.status = "playing";
    game.score = 0;
    game.lives = INITIAL_LIVES;
    game.level = 1;
    game.shots = 0;
    game.hits = 0;
    game.bullets = [];
    game.particles = [];
    game.keys.clear();
    resetShip(game, performance.now() / 1000);
    spawnWave(game);
    syncSnapshot();
  }, [syncSnapshot]);

  const togglePause = useCallback(() => {
    const game = gameRef.current;
    if (game.status === "playing") {
      game.status = "paused";
    } else if (game.status === "paused") {
      game.status = "playing";
    }
    syncSnapshot();
  }, [syncSnapshot]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;

    if (!stage || !canvas) {
      return;
    }

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const height = Math.max(420, Math.min(680, Math.floor(width * 0.62)));
      const density = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * density);
      canvas.height = Math.floor(height * density);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      if (context) {
        context.setTransform(density, 0, 0, density, 0, 0);
      }

      const game = gameRef.current;
      game.width = width;
      game.height = height;
      wrapPosition(game.ship.position, width, height, game.ship.radius);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) {
        event.preventDefault();
      }

      const game = gameRef.current;

      if (event.code === "KeyP") {
        togglePause();
        return;
      }

      if (event.code === "Enter" && game.status !== "playing") {
        startGame();
        return;
      }

      game.keys.add(event.code);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      gameRef.current.keys.delete(event.code);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [startGame, togglePause]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const game = gameRef.current;
      const lastFrame = lastFrameRef.current ?? timestamp;
      const delta = Math.min((timestamp - lastFrame) / 1000, 0.034);
      const now = timestamp / 1000;
      lastFrameRef.current = timestamp;

      if (game.status === "playing") {
        updatePlaying(game, delta, now);
      }

      updateParticles(game, delta);

      if (context) {
        drawGame(context, game, now);
      }

      game.snapshotTimer += delta;
      if (game.snapshotTimer > 0.14) {
        game.snapshotTimer = 0;
        syncSnapshot();
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [syncSnapshot]);

  const isPlaying = snapshot.status === "playing";
  const canPause = snapshot.status === "playing" || snapshot.status === "paused";

  useEffect(() => {
    palette = theme.palette.mode === "dark" ? gamePalettes.dark : gamePalettes.light;
  }, [theme.palette.mode]);

  return (
    <Card
      component="section"
      sx={{
        p: { xs: 1, md: 1.25 },
        borderRadius: 2,
        overflow: "hidden",
        background: "background.paper",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between" }}
        >
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip label={`Score ${snapshot.score}`} color="primary" />
            <Chip label={`Best ${snapshot.highScore}`} variant="outlined" />
            <Chip label={`Wave ${snapshot.level}`} variant="outlined" />
            <Chip label={`Lives ${snapshot.lives}`} variant="outlined" />
            <Chip label={`${snapshot.accuracy}% accuracy`} variant="outlined" />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={startGame}
              startIcon={snapshot.status === "ready" ? <PlayArrowRoundedIcon /> : <RestartAltRoundedIcon />}
            >
              {snapshot.status === "ready" ? "Start Mission" : "Restart"}
            </Button>
            <Button
              variant="outlined"
              disabled={!canPause}
              onClick={togglePause}
              startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            >
              {isPlaying ? "Pause" : "Resume"}
            </Button>
          </Stack>
        </Stack>

        <Box
          ref={stageRef}
          sx={{
            position: "relative",
            width: "100%",
            overflow: "hidden",
            borderRadius: 1.5,
            border: 1,
            borderColor: "divider",
            background: palette.frameBackground,
          }}
        >
          <canvas
            ref={canvasRef}
            aria-label="Cursteroids canvas game"
            role="img"
            style={{
              display: "block",
              width: "100%",
              outline: "none",
            }}
          />
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography color="text.secondary" variant="body2">
            Fly with Arrow keys or WASD. Fire with Space. Pause with P. Restart with Enter.
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            <Typography color="text.secondary" variant="caption">
              Cursor mode
            </Typography>
            <KeyboardArrowRightRoundedIcon color="primary" fontSize="small" />
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
