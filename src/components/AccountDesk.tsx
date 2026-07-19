"use client";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { ACCOUNT_DESK_TURNS, type DeskChoice } from "@/game/dialogue";

type TranscriptEntry = {
  turnId: string;
  choice: DeskChoice;
};

export function AccountDesk() {
  const [turnIndex, setTurnIndex] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [finished, setFinished] = useState(false);

  const turn = ACCOUNT_DESK_TURNS[turnIndex];
  const progressLabel = useMemo(
    () => `Huddle ${Math.min(turnIndex + 1, ACCOUNT_DESK_TURNS.length)} / ${ACCOUNT_DESK_TURNS.length}`,
    [turnIndex],
  );

  function pick(choice: DeskChoice) {
    if (!turn) {
      return;
    }
    const nextTranscript = [...transcript, { turnId: turn.id, choice }];
    setTranscript(nextTranscript);

    if (turnIndex >= ACCOUNT_DESK_TURNS.length - 1) {
      setFinished(true);
      return;
    }
    setTurnIndex((index) => index + 1);
  }

  function restart() {
    setTurnIndex(0);
    setTranscript([]);
    setFinished(false);
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={0.75}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Account desk
          </Typography>
          <Chip size="small" label={progressLabel} variant="outlined" />
        </Stack>
        <Typography color="text.secondary" variant="body2">
          A short ADM huddle. Pick the intervention you would run — the coach answers like a
          senior on the Customer Education team.
        </Typography>
      </Stack>

      <Stack spacing={1.25}>
        {transcript.map((entry) => (
          <Stack
            key={`${entry.turnId}-${entry.choice.id}`}
            spacing={0.75}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: 1,
              borderColor: "divider",
              background: "background.default",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              You chose
            </Typography>
            <Typography variant="body2">{entry.choice.label}</Typography>
            <Typography variant="body2" color="text.secondary">
              {entry.choice.coach}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Role lesson: {entry.choice.teach}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {!finished && turn ? (
        <Stack
          spacing={1.25}
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {turn.from}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {turn.message}
          </Typography>
          <Stack spacing={1}>
            {turn.choices.map((choice) => (
              <Button
                key={choice.id}
                variant="outlined"
                onClick={() => pick(choice)}
                sx={{
                  textTransform: "none",
                  justifyContent: "flex-start",
                  textAlign: "left",
                }}
              >
                {choice.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      ) : null}

      {finished ? (
        <Stack spacing={1.25}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Huddle complete
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Notice the pattern: diagnose the account, pick an intervention that fits the
            constraint, protect Trust, and leave something repeatable. That is the AI Adoption
            Engineer job in miniature.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button size="small" variant="contained" href="#game">
              Play the mission
            </Button>
            <Button size="small" variant="outlined" onClick={restart}>
              Run huddle again
            </Button>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
}
