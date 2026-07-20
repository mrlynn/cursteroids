"use client";

import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
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
import { FitShareCard } from "@/components/FitShareCard";
import { HowToPlayDialog, markOnboarded, useOnboarded } from "@/components/HowToPlay";
import { PhaseDebriefPanel } from "@/components/PhaseDebrief";
import { TouchControls, useCoarsePointer } from "@/components/TouchControls";
import { phaseLabel } from "@/game/campaign";
import { CHALLENGE_BRIEF, REPO_URL } from "@/game/challenge";
import {
  AGENT_MAX_CHARGES,
  APPLY_WITH_CHALLENGE_HINT,
  CAREERS_URL,
  CAMPAIGN_PHASES,
  TRUST_START,
} from "@/game/constants";
import type { PhaseDebrief } from "@/game/dialogue";
import {
  completeDebrief,
  createInitialGame,
  drawGame,
  getPalette,
  getSnapshot,
  setPalette,
  startMission,
  timeScaleFor,
  updateParticles,
  updatePlaying,
  wrapPosition,
} from "@/game/engine";
import { createSequenceDetector, KONAMI_SEQUENCE } from "@/game/easter-eggs";
import { InputController } from "@/game/input";
import { POWERUP_KINDS } from "@/game/powerups";
import { buildScorecard } from "@/game/scorecard";
import type { GameSnapshot } from "@/game/types";

function emptySnapshot(): GameSnapshot {
  return {
    status: "ready",
    score: 0,
    highScore: 0,
    trust: TRUST_START,
    level: 1,
    asteroids: 0,
    accuracy: 100,
    nearMisses: 0,
    tabAccepts: 0,
    conversions: 0,
    agentDeploys: 0,
    agentCharges: 0,
    rulesCoverageCount: 0,
    blockersCleared: {},
    powerupsCollected: 0,
    powerupsUsedWell: 0,
    activePowerup: null,
    toast: null,
    debriefs: [],
    debriefPhase: 0,
    waveModifierLabel: null,
  };
}

export function CursteroidsGame() {
  const theme = useTheme();
  const isCoarsePointer = useCoarsePointer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const nowRef = useRef(0);
  const gameRef = useRef(createInitialGame());
  // A stable InputController instance. Plain state (not a ref) so it can be
  // read during render — e.g. passed straight to <TouchControls> — without
  // tripping the "don't read ref.current during render" rule; the object
  // identity never changes because the setter is never called again.
  const [input] = useState(() => new InputController());
  const [snapshot, setSnapshot] = useState<GameSnapshot>(emptySnapshot);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const onboarded = useOnboarded();
  const [manualHelpOpen, setManualHelpOpen] = useState(false);
  // Auto-open on first visit (until dismissed once), or when reopened via the button.
  const helpOpen = manualHelpOpen || !onboarded;

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

  const onDebriefComplete = useCallback(
    (debrief: PhaseDebrief) => {
      completeDebrief(gameRef.current, debrief, performance.now() / 1000);
      syncSnapshot();
    },
    [syncSnapshot],
  );

  const openHelp = useCallback(() => {
    const game = gameRef.current;
    if (game.status === "playing") {
      game.status = "paused";
      syncSnapshot();
    }
    setManualHelpOpen(true);
  }, [syncSnapshot]);

  const closeHelp = useCallback(() => {
    setManualHelpOpen(false);
    markOnboarded();
  }, []);

  const startFromHelp = useCallback(() => {
    closeHelp();
    startGame();
  }, [closeHelp, startGame]);

  const scorecard = buildScorecard(snapshot);
  const showScorecard =
    snapshot.status === "gameOver" || snapshot.status === "missionComplete";
  const showDebrief = snapshot.status === "debriefing";

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
      const aspect = width < 500 ? 0.9 : 0.62;
      const height = Math.max(420, Math.min(680, Math.floor(width * aspect)));
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
    const controller = input;
    const konami = createSequenceDetector(KONAMI_SEQUENCE, () => {
      const game = gameRef.current;
      game.effects.agentCharges = AGENT_MAX_CHARGES;
      game.toast = "Founding-engineer mode: agents fully staffed. Ship it.";
      game.toastUntil = nowRef.current + 3.2;
      syncSnapshot();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      konami(event.code);
      const game = gameRef.current;

      // While the how-to-play dialog is up, leave every key to the dialog
      // (Enter would otherwise start a mission behind it).
      if (helpOpen) {
        return;
      }

      if (game.status === "debriefing") {
        // Stop the page from scrolling under the form, but leave Tab alone
        // so it still navigates focus between the debrief's buttons.
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(event.code)) {
          event.preventDefault();
        }
        return;
      }

      if (
        event.code === "Enter" &&
        game.status !== "playing" &&
        game.status !== "paused"
      ) {
        event.preventDefault();
        startGame();
        return;
      }

      controller.handleKeyDown(event);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      controller.handleKeyUp(event);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      controller.reset();
    };
  }, [helpOpen, input, startGame, syncSnapshot]);

  useEffect(() => {
    const tick = (timestamp: number) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const game = gameRef.current;
      const lastFrame = lastFrameRef.current ?? timestamp;
      const rawDelta = Math.min((timestamp - lastFrame) / 1000, 0.034);
      const now = timestamp / 1000;
      lastFrameRef.current = timestamp;
      nowRef.current = now;

      const intent = input.poll();

      if (intent.pause) {
        togglePause();
      }

      if (game.status === "playing") {
        const delta = rawDelta * timeScaleFor(game, now);
        updatePlaying(game, delta, now, intent);
        updateParticles(game, delta);
      } else {
        updateParticles(game, rawDelta);
      }

      if (context) {
        drawGame(context, game, now);
      }

      game.snapshotTimer += rawDelta;
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
  }, [input, syncSnapshot, togglePause]);

  useEffect(() => {
    setPalette(theme.palette.mode === "dark" ? "dark" : "light");
  }, [theme.palette.mode]);

  const isPlaying = snapshot.status === "playing";
  const canPause = snapshot.status === "playing" || snapshot.status === "paused";
  const palette = getPalette();

  return (
    <Card
      id="game"
      component="section"
      sx={{
        p: { xs: 1, md: 1.25 },
        borderRadius: 2,
        overflow: "hidden",
        background: "background.paper",
        scrollMarginTop: 24,
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
            <Chip
              label={`Trust ${snapshot.trust}/100`}
              color={snapshot.trust <= 30 ? "error" : "default"}
              variant="outlined"
            />
            <Chip label={`${snapshot.accuracy}% accuracy`} variant="outlined" />
            {snapshot.agentCharges > 0 ? (
              <Chip label={`Agent x${snapshot.agentCharges} (E)`} variant="outlined" />
            ) : null}
            {snapshot.conversions > 0 ? (
              <Chip label={`Converted ${snapshot.conversions}`} variant="outlined" />
            ) : null}
            {snapshot.activePowerup ? (
              <Chip label={snapshot.activePowerup} color="secondary" variant="outlined" />
            ) : null}
            {snapshot.waveModifierLabel ? (
              <Chip label={snapshot.waveModifierLabel} color="info" variant="outlined" />
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
            <Button
              variant="outlined"
              onClick={openHelp}
              startIcon={<HelpOutlineRoundedIcon />}
              aria-label="How to play"
            >
              How to play
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

          <TouchControls
            input={input}
            agentCharges={snapshot.agentCharges}
            status={snapshot.status}
            onStart={startGame}
          />
        </Box>

        <HowToPlayDialog
          open={helpOpen}
          onClose={closeHelp}
          onStart={startFromHelp}
          isCoarsePointer={isCoarsePointer}
        />

        {showDebrief ? (
          <PhaseDebriefPanel
            phase={snapshot.debriefPhase || snapshot.level}
            onComplete={onDebriefComplete}
          />
        ) : null}

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

              {scorecard.debriefs.length > 0 ? (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Your phase retros
                  </Typography>
                  {scorecard.debriefs.map((debrief) => (
                    <Typography key={debrief.phase} variant="body2" color="text.secondary">
                      Phase {debrief.phase} · {debrief.intervention}. Leave behind:{" "}
                      {debrief.leaveBehind}
                      {debrief.note ? ` (${debrief.note})` : ""}
                    </Typography>
                  ))}
                </Stack>
              ) : null}

              <FitShareCard card={scorecard.fitCard} applyHref={CAREERS_URL} />

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
                <Button size="small" variant="text" href="#artifact-challenge">
                  Read the brief
                </Button>
              </Stack>
            </Stack>
          </Card>
        ) : null}

        <Typography color="text.secondary" variant="body2">
          {isCoarsePointer
            ? `Drag the left side of the stage to fly — sideways to turn, up to thrust. TAB snap-fires the suggested target (the dotted line), FIRE shoots, and E deploys a banked Cloud Agent charge. Pick up artifact powerups: ${POWERUP_KINDS.join(", ")}.`
            : `Fly with Arrow keys or WASD. Fire with Space. Press Tab to snap-fire at the suggested target (the dotted line). Press E to deploy a banked Cloud Agent charge at chore blockers. Fly alongside a "won't break" blocker to pair with and convert it. Pause with P. Pick up artifact powerups: ${POWERUP_KINDS.join(", ")}.`}
        </Typography>
      </Stack>
    </Card>
  );
}
