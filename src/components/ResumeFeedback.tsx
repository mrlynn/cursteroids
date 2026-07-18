"use client";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { CAREERS_URL } from "@/game/constants";
import type { ResumeFeedbackResult } from "@/game/roles/resume-feedback-schema";

type ApiSuccess = {
  role: { id: string; title: string; careersUrl: string };
  feedback: ResumeFeedbackResult;
  scoreScale?: { min: number; max: number; label: string };
  disclaimer: string;
};

function formatScore(score: number, max = 10) {
  const rounded = Math.round(score * 10) / 10;
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${display} / ${max}`;
}

type ApiError = { error: string };

const FIT_COLOR: Record<
  ResumeFeedbackResult["overallFit"],
  "success" | "info" | "warning" | "default"
> = {
  strong: "success",
  promising: "info",
  stretch: "warning",
  unlikely: "default",
};

export function ResumeFeedback() {
  const [file, setFile] = useState<File | null>(null);
  const [pasted, setPasted] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiSuccess | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setResult(null);

    const body = new FormData();
    if (file) {
      body.append("resume", file);
    }
    if (pasted.trim()) {
      body.append("resumeText", pasted.trim());
    }

    try {
      const response = await fetch("/api/resume-feedback", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as ApiSuccess | ApiError;

      if (!response.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong.");
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("done");
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  }

  const canSubmit = Boolean(file || pasted.trim()) && status !== "loading";

  return (
    <Stack spacing={2.5} component="form" onSubmit={onSubmit}>
      <Stack spacing={1}>
        <Typography variant="overline" color="text.secondary">
          Role fit check
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Upload your resume for AI Adoption Engineer feedback
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 860 }}>
          Get a private, advisory read against the real role rubric: facilitation, technical
          credibility, behavior change, systems, customer context, and communication range. Your
          file is analyzed in memory and not stored.
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadRoundedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          {file ? file.name : "Choose PDF or .txt"}
          <Box
            component="input"
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
            hidden
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const next = event.target.files?.[0] ?? null;
              setFile(next);
            }}
          />
        </Button>

        <TextField
          label="Or paste resume text"
          multiline
          minRows={5}
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          placeholder="Paste a text version of your resume if you prefer not to upload a file."
        />

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {status === "loading" ? "Reading resume…" : "Get role feedback"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            Advisory only · not an official hiring decision
          </Typography>
        </Stack>
      </Stack>

      {status === "loading" ? <LinearProgress /> : null}

      {error ? <Alert severity="error">{error}</Alert> : null}

      {result ? (
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
          >
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary">
                {result.role.title}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {result.feedback.headline}
              </Typography>
              <Typography color="text.secondary">{result.feedback.summary}</Typography>
            </Stack>
            <Stack spacing={0.75} sx={{ alignItems: { xs: "flex-start", sm: "flex-end" } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Chip
                  label={result.feedback.overallFit}
                  color={FIT_COLOR[result.feedback.overallFit]}
                  sx={{ textTransform: "capitalize", fontWeight: 700 }}
                />
                <Chip
                  label={`Overall ${formatScore(result.feedback.overallScore)}`}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                All scores are out of 10
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1.25}>
            {result.feedback.dimensions.map((dimension) => (
              <Stack key={dimension.id} spacing={0.4}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {dimension.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {formatScore(dimension.score)}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(dimension.score / 10) * 100}
                  sx={{ height: 6, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Evidence: {dimension.evidence}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gap: {dimension.gap}
                </Typography>
                <Typography variant="caption">Advice: {dimension.advice}</Typography>
              </Stack>
            ))}
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Strengths
              </Typography>
              {result.feedback.strengths.map((item) => (
                <Typography key={item} variant="body2" color="text.secondary">
                  · {item}
                </Typography>
              ))}
            </Stack>
            <Stack spacing={0.75} sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Gaps
              </Typography>
              {result.feedback.gaps.map((item) => (
                <Typography key={item} variant="body2" color="text.secondary">
                  · {item}
                </Typography>
              ))}
            </Stack>
          </Stack>

          <Stack spacing={0.75}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Next steps
            </Typography>
            {result.feedback.nextSteps.map((item) => (
              <Typography key={item} variant="body2" color="text.secondary">
                · {item}
              </Typography>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button variant="contained" href="#builder-challenge">
              Try the builder challenge
            </Button>
            <Button
              variant="outlined"
              href={result.role.careersUrl || CAREERS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply to {result.role.title}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {result.disclaimer}
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
}
