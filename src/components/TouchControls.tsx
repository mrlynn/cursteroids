"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { InputController } from "@/game/input";
import type { GameStatus } from "@/game/types";

const COARSE_POINTER_QUERY = "(pointer: coarse)";

function subscribeCoarsePointer(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const query = window.matchMedia(COARSE_POINTER_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getCoarsePointerSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

function getCoarsePointerServerSnapshot() {
  return false;
}

/**
 * True on devices whose primary pointer is coarse (touch) rather than fine
 * (mouse/trackpad). Deliberately not user-agent sniffing — a Surface with a
 * mouse attached should still get the desktop experience, and vice versa.
 * `useSyncExternalStore` (rather than state-in-an-effect) is the correct tool
 * here since `matchMedia` is an external store: it renders the SSR-safe
 * `false` snapshot on the server/first paint and reconciles to the real
 * value right after hydration with no mismatch warnings.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getCoarsePointerServerSnapshot,
  );
}

const JOYSTICK_RADIUS = 46;
const TURN_THRESHOLD = 10;
const THRUST_THRESHOLD = 14;

type JoystickVisual = {
  baseX: number;
  baseY: number;
  nubX: number;
  nubY: number;
};

function JoystickZone({ input }: { input: InputController }) {
  const theme = useTheme();
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const baseRef = useRef<{ x: number; y: number } | null>(null);
  const [visual, setVisual] = useState<JoystickVisual | null>(null);

  const updateFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const zone = zoneRef.current;
      const base = baseRef.current;
      if (!zone || !base) {
        return;
      }
      const rect = zone.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      let dx = localX - base.x;
      let dy = localY - base.y;
      const dist = Math.hypot(dx, dy);
      if (dist > JOYSTICK_RADIUS) {
        dx = (dx / dist) * JOYSTICK_RADIUS;
        dy = (dy / dist) * JOYSTICK_RADIUS;
      }

      setVisual({ baseX: base.x, baseY: base.y, nubX: base.x + dx, nubY: base.y + dy });
      input.setAxis(dx > TURN_THRESHOLD ? 1 : dx < -TURN_THRESHOLD ? -1 : 0);
      input.setThrust(dy < -THRUST_THRESHOLD);
    },
    [input],
  );

  const endTouch = useCallback(() => {
    pointerIdRef.current = null;
    baseRef.current = null;
    setVisual(null);
    input.setAxis(0);
    input.setThrust(false);
  }, [input]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (pointerIdRef.current !== null) {
        return;
      }
      const zone = zoneRef.current;
      if (!zone) {
        return;
      }
      const rect = zone.getBoundingClientRect();
      pointerIdRef.current = event.pointerId;
      baseRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClient(event.clientX, event.clientY);
    },
    [updateFromClient],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.preventDefault();
      updateFromClient(event.clientX, event.clientY);
    },
    [updateFromClient],
  );

  const onPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      endTouch();
    },
    [endTouch],
  );

  return (
    <Box
      ref={zoneRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onTouchStart={(event) => event.preventDefault()}
      aria-hidden="true"
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "58%",
        touchAction: "none",
      }}
    >
      {visual ? (
        <>
          <Box
            sx={{
              position: "absolute",
              left: visual.baseX - 48,
              top: visual.baseY - 48,
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: alpha(theme.palette.text.primary, 0.08),
              border: `1px solid ${alpha(theme.palette.text.primary, 0.25)}`,
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: visual.nubX - 22,
              top: visual.nubY - 22,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: alpha(theme.palette.primary.main, 0.45),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.7)}`,
              pointerEvents: "none",
            }}
          />
        </>
      ) : null}
    </Box>
  );
}

type RoundButtonProps = {
  label: string;
  size: number;
  ariaLabel: string;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  active?: boolean;
  emphasize?: boolean;
};

function RoundButton({
  label,
  size,
  ariaLabel,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  active,
  emphasize,
}: RoundButtonProps) {
  const theme = useTheme();
  const base = emphasize ? theme.palette.primary.main : theme.palette.text.primary;

  return (
    <Box
      role="button"
      aria-label={ariaLabel}
      tabIndex={-1}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerCancel}
      onTouchStart={(event) => event.preventDefault()}
      onContextMenu={(event) => event.preventDefault()}
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        touchAction: "none",
        background: alpha(base, active ? 0.42 : 0.22),
        border: `1px solid ${alpha(base, 0.55)}`,
        color: emphasize ? theme.palette.primary.contrastText : theme.palette.text.primary,
        boxShadow: active ? `0 0 0 4px ${alpha(base, 0.18)}` : "none",
        transition: "background 80ms ease, box-shadow 80ms ease",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, fontSize: Math.max(11, size * 0.24), letterSpacing: 0.5 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

type TouchControlsProps = {
  input: InputController;
  agentCharges: number;
  status: GameStatus;
  onStart: () => void;
};

export function TouchControls({ input, agentCharges, status, onStart }: TouchControlsProps) {
  const isCoarsePointer = useCoarsePointer();
  const [fireActive, setFireActive] = useState(false);

  const handleTabDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      input.pressTab();
    },
    [input],
  );

  const handleDeployDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      input.pressDeploy();
    },
    [input],
  );

  const handleFireDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      input.pressFire(true);
      setFireActive(true);
    },
    [input],
  );

  const handleFireUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      input.pressFire(false);
      setFireActive(false);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [input],
  );

  if (!isCoarsePointer) {
    return null;
  }

  const awaitingStart =
    status === "ready" || status === "gameOver" || status === "missionComplete";

  if (awaitingStart) {
    return (
      <Box
        onPointerDown={(event) => {
          event.preventDefault();
          onStart();
        }}
        onTouchStart={(event) => event.preventDefault()}
        role="button"
        aria-label="Tap to start mission"
        sx={{ position: "absolute", inset: 0, touchAction: "none" }}
      />
    );
  }

  return (
    <Box sx={{ position: "absolute", inset: 0, touchAction: "none" }}>
      <JoystickZone input={input} />

      <Box
        sx={{
          position: "absolute",
          right: 14,
          bottom: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        {agentCharges > 0 ? (
          <RoundButton
            label="E"
            size={48}
            ariaLabel="Deploy Cloud Agent charge"
            onPointerDown={handleDeployDown}
          />
        ) : null}
        <RoundButton
          label="FIRE"
          size={64}
          ariaLabel="Fire (hold)"
          active={fireActive}
          onPointerDown={handleFireDown}
          onPointerUp={handleFireUp}
          onPointerCancel={handleFireUp}
        />
        <RoundButton
          label="TAB"
          size={84}
          ariaLabel="Accept suggested target"
          emphasize
          onPointerDown={handleTabDown}
        />
      </Box>
    </Box>
  );
}
