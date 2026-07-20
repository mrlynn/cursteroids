"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { debriefQuestionsForPhase, type PhaseDebrief } from "@/game/dialogue";
import { WAVE_BRIEFS } from "@/game/campaign";
import { modifierForIntervention, modifierPreviewText } from "@/game/modifiers";

type PhaseDebriefProps = {
  phase: number;
  onComplete: (debrief: PhaseDebrief) => void;
};

export function PhaseDebriefPanel({ phase, onComplete }: PhaseDebriefProps) {
  const questions = useMemo(() => debriefQuestionsForPhase(phase), [phase]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  const ready =
    Boolean(answers.strugglingMoment) &&
    Boolean(answers.intervention) &&
    Boolean(answers.leaveBehind);

  function submit() {
    if (!ready) {
      return;
    }
    onComplete({
      phase,
      phaseLabel: WAVE_BRIEFS[Math.max(0, phase - 1)] ?? `Phase ${phase}`,
      strugglingMoment: answers.strugglingMoment,
      intervention: answers.intervention,
      leaveBehind: answers.leaveBehind,
      note: note.trim() || undefined,
    });
  }

  return (
    <Stack spacing={2} sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="overline" color="text.secondary">
          Phase {phase} retro
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Think like an AI Adoption Engineer
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Credibility comes from what you ship alongside the team. Pick the artifact and habit
          change you would leave behind, then continue the mission.
        </Typography>
      </Stack>

      {questions.map((question) => (
        <Stack key={question.id} spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {question.prompt}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {question.options.map((option) => {
              const selected = answers[question.id] === option;
              return (
                <Button
                  key={option}
                  size="small"
                  variant={selected ? "contained" : "outlined"}
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: option,
                    }))
                  }
                  sx={{ textTransform: "none", justifyContent: "flex-start" }}
                >
                  {option}
                </Button>
              );
            })}
          </Stack>
          {question.id === "intervention" && answers.intervention ? (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {modifierPreviewText(modifierForIntervention(answers.intervention))}
            </Typography>
          ) : null}
        </Stack>
      ))}

      <TextField
        label="Optional note (one line)"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="e.g. I'd pull Security into the Rules workshop before the VP readout."
        size="small"
      />

      <Button variant="contained" disabled={!ready} onClick={submit}>
        {phase >= 4 ? "Finish mission" : "Continue to next phase"}
      </Button>
    </Stack>
  );
}
