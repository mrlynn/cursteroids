"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSyncExternalStore } from "react";

/** First visit: the dialog opens automatically until the player dismisses it once. */
export const ONBOARDING_STORAGE_KEY = "cursteroids:onboarded:v1";

const onboardingListeners = new Set<() => void>();

function subscribeOnboarding(listener: () => void) {
  onboardingListeners.add(listener);
  return () => onboardingListeners.delete(listener);
}

function readOnboarded(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    // Blocked storage: treat as onboarded rather than nag on every visit.
    return true;
  }
}

/**
 * Whether the player has dismissed the how-to-play dialog before.
 * Returns true during SSR so the dialog never flashes in prerendered HTML.
 */
export function useOnboarded(): boolean {
  return useSyncExternalStore(subscribeOnboarding, readOnboarded, () => true);
}

export function markOnboarded() {
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
  } catch {
    // Private browsing: the dialog just reopens next visit.
  }
  onboardingListeners.forEach((listener) => listener());
}

type HowToPlayDialogProps = {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  isCoarsePointer: boolean;
};

function Key({ children }: { children: string }) {
  return (
    <Box
      component="kbd"
      sx={{
        px: 0.75,
        py: 0.1,
        borderRadius: 0.75,
        border: 1,
        borderColor: "divider",
        borderBottomWidth: 2,
        fontFamily: "var(--font-geist-mono, monospace)",
        fontSize: "0.75rem",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}

const MECHANICS: { label: string; detail: string }[] = [
  {
    label: "Trust is your health",
    detail:
      "Collisions and overclaiming (long miss streaks) burn it. Converting skeptics and clearing phases rebuild it. At zero, you've lost the room.",
  },
  {
    label: "Tab suggestions",
    detail:
      "A dotted line marks the best target. Press Tab to accept and snap-fire. Accepting a good suggestion beats aiming by hand.",
  },
  {
    label: "“Won't break” blockers",
    detail:
      "Low trust in AI and IDE skepticism can't be shot down. Fly alongside them to pair — the arc fills, and they convert into allies.",
  },
  {
    label: "Agents take the toil",
    detail:
      "Cloud Agent pickups bank a charge. Deploy one at chore blockers (CI failures, docs drift) while you handle the judgment calls.",
  },
  {
    label: "Rules outlive the session",
    detail:
      "A Rules pickup permanently weakens future spawns of a blocker type — for the rest of the run.",
  },
  {
    label: "Retros have consequences",
    detail:
      "After each phase you pick an intervention. Your choice concretely changes the next wave.",
  },
];

export function HowToPlayDialog({ open, onClose, onStart, isCoarsePointer }: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 0.5 }}>
        <Stack spacing={0.25}>
          <Typography component="span" variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Welcome to Cursteroids
          </Typography>
          <Typography component="span" color="text.secondary" variant="body2">
            The job description you can play.
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1.5 }}>
          <Typography color="text.secondary" variant="body2">
            Cursor is hiring an <strong>AI Adoption Engineer</strong> — someone who turns AI pilots
            into permanent practice inside enterprise engineering orgs. Instead of making you read
            the job description, we made it playable. Every mechanic below is a real part of the
            role.
          </Typography>

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Controls
            </Typography>
            {isCoarsePointer ? (
              <Typography color="text.secondary" variant="body2">
                Drag on the left half of the screen to fly. Tap <strong>TAB</strong> to snap-fire at
                the suggested target, hold <strong>FIRE</strong> to shoot, and tap{" "}
                <strong>E</strong> to deploy an Agent when you have a charge banked.
              </Typography>
            ) : (
              <Stack spacing={0.75}>
                <Typography color="text.secondary" variant="body2">
                  <Key>←</Key> <Key>→</Key> or <Key>A</Key> <Key>D</Key> turn · <Key>↑</Key> or{" "}
                  <Key>W</Key> thrust · <Key>Space</Key> fire
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  <Key>Tab</Key> accept the suggestion (snap-fire the highlighted target) ·{" "}
                  <Key>E</Key> deploy a banked Agent
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  <Key>Enter</Key> start · <Key>P</Key> pause
                </Typography>
              </Stack>
            )}
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              The mechanics are the job
            </Typography>
            {MECHANICS.map((item) => (
              <Stack key={item.label} direction="row" spacing={1} sx={{ alignItems: "baseline" }}>
                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 150, flexShrink: 0 }}>
                  {item.label}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {item.detail}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Who this is for
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Senior engineers, DevEx practitioners, and developer advocates who have watched good
              tooling fail because nobody built the habits around it. If ninety seconds of this
              feels like your day job, read the role brief below the game.
            </Typography>
            <Typography color="text.secondary" variant="body2">
              And relax about the score — the arcade score is never the hiring filter. The artifact
              challenge at the bottom of the page is.
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Got it</Button>
        <Button variant="contained" onClick={onStart} autoFocus>
          Start mission
        </Button>
      </DialogActions>
    </Dialog>
  );
}
