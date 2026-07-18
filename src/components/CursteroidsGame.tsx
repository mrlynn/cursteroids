"use client";

import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { phaseLabel } from "@/game/campaign";
import { CHALLENGE_BRIEF, REPO_URL } from "@/game/challenge";
import {
  APPLY_WITH_CHALLENGE_HINT,
  CAREERS_URL,
  CAMPAIGN_PHASES,
  INITIAL_LIVES,
} from "@/game/constants";
import {
  createInitialGame,
  drawGame,
  getPalette,
  getSnapshot,
  setPalette,
  startMission,
  updateParticles,
  updatePlaying,
  wrapPosition,
} from "@/game/engine";
import { POWERUP_KINDS } from "@/game/powerups";
import { buildScorecard } from "@/game/scorecard";
import type { GameSnapshot } from "@/game/types";

function emptySnapshot(): GameSnapshot {
  return {
    status: "ready",
    score: 0,
    highScore: 0,
    lives: INITIAL_LIVES,
    level: 1,
    asteroids: 0,
    accuracy: 100,
    nearMisses: 0,
    blockersCleared: {},
    powerupsCollected: 0,
    powerupsUsedWell: 0,
    activePowerup: null,
    toast: null,
  };
}

export function CursteroidsGame() {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const nowRef = useRef(0);
  const gameRef = useRef(createInitialGame());
  const [snapshot, setSnapshot] = useState<GameSnapshot>(emptySnapshot);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  const syncSnapshot = useCallback(() => {
    setSnapshot(getSnapshot(gameRef.current, nowRef.current));
  }, []);

  const startGame = useCallback(() => {
    startMission(gameRef.current, performance.now() / 1000);
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

  const scorecard = buildScorecard(snapshot);
  const showScorecard =
    snapshot.status === "gameOver" || snapshot.status === "missionComplete";

  const copyShareText = useCallback(async () => {
    await navigator.clipboard.writeText(scorecard.shareText);
    setShareStatus("copied");
    window.setTimeout(() => setShareStatus("idle"), 1600);
  }, [scorecard.shareText]);

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
      nowRef.current = now;

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

  useEffect(() => {
    setPalette(theme.palette.mode === "dark" ? "dark" : "light");
  }, [theme.palette.mode]);

  const isPlaying = snapshot.status === "playing";
  const canPause = snapshot.status === "playing" || snapshot.status === "paused";
  const palette = getPalette();

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
            <Chip label={`Impact ${Math.max(0, Math.round(snapshot.score))}`} color="primary" />
            <Chip label={`Best ${snapshot.highScore}`} variant="outlined" />
            <Chip
              label={phaseLabel(Math.min(snapshot.level, CAMPAIGN_PHASES))}
              variant="outlined"
            />
            <Chip label={`Trust ${snapshot.lives}`} variant="outlined" />
            <Chip label={`${snapshot.accuracy}% accuracy`} variant="outlined" />
            {snapshot.activePowerup ? (
              <Chip label={snapshot.activePowerup} color="secondary" variant="outlined" />
            ) : null}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={startGame}
              startIcon={
                snapshot.status === "ready" ? <PlayArrowRoundedIcon /> : <RestartAltRoundedIcon />
              }
            >
              {snapshot.status === "ready" ? "Start mission" : "Restart"}
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

        {showScorecard ? (
          <Card
            variant="outlined"
            sx={{
              p: 2,
              background: "background.default",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{ justifyContent: "space-between" }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="overline" color="text.secondary">
                    {scorecard.completedMission ? "Mission scorecard" : "Recruiting scorecard"}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {scorecard.headline}
                  </Typography>
                  <Typography color="text.secondary">{scorecard.summary}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
                  <Button variant="outlined" onClick={copyShareText}>
                    {shareStatus === "copied" ? "Copied" : "Copy share text"}
                  </Button>
                  <Button
                    variant="contained"
                    href={CAREERS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply
                  </Button>
                </Stack>
              </Stack>

              <Stack spacing={1}>
                {scorecard.dimensions.map((dimension) => (
                  <Stack key={dimension.id} spacing={0.35}>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {dimension.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dimension.score}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={dimension.score}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {dimension.blurb}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider />
              <Typography color="text.secondary" variant="body2">
                {CHALLENGE_BRIEF}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {APPLY_WITH_CHALLENGE_HINT}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="outlined"
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fork the challenge
                </Button>
                <Button
                  size="small"
                  variant="text"
                  href="#builder-challenge"
                >
                  Read the brief
                </Button>
              </Stack>
            </Stack>
          </Card>
        ) : null}

        <Typography color="text.secondary" variant="body2">
          Fly with Arrow keys or WASD. Fire with Space. Pause with P. Pick up{" "}
          {POWERUP_KINDS.join(", ")} drops to use real Cursor-shaped tools.
        </Typography>
      </Stack>
    </Card>
  );
}
