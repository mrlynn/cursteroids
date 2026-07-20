"use client";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { CAREERS_URL } from "@/game/constants";
import type { FitSharePayload } from "@/game/share";

type FitShareCardProps = {
  card: FitSharePayload;
  applyHref?: string;
};

export function FitShareCard({ card, applyHref = CAREERS_URL }: FitShareCardProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "linkCopied">("idle");

  async function copy() {
    await navigator.clipboard.writeText(card.shareText);
    setStatus("copied");
    window.setTimeout(() => setStatus("idle"), 1600);
  }

  async function copyLink() {
    if (!card.runUrl) return;
    await navigator.clipboard.writeText(card.runUrl);
    setStatus("linkCopied");
    window.setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        background: "background.default",
      }}
    >
      <Stack spacing={1.25}>
        <Typography variant="overline" color="text.secondary">
          Shareable fit card
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {card.headline}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {card.artifactLine}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {card.roleLine}
        </Typography>
        {card.runUrl ? (
          <Typography
            color="text.secondary"
            variant="caption"
            sx={{ fontFamily: "var(--font-geist-mono, monospace)", wordBreak: "break-all" }}
          >
            {card.runUrl}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {card.runUrl ? (
            <Button variant="contained" size="small" onClick={copyLink}>
              {status === "linkCopied" ? "Link copied" : "Copy result link"}
            </Button>
          ) : null}
          <Button variant={card.runUrl ? "outlined" : "contained"} size="small" onClick={copy}>
            {status === "copied" ? "Copied" : "Copy LinkedIn post"}
          </Button>
          <Button
            variant="outlined"
            size="small"
            href={applyHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply
          </Button>
          <Button size="small" variant="text" href="#artifact-challenge">
            Artifact challenge
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
