import { CAMPAIGN_PHASES } from "@/game/constants";

export const WAVE_BRIEFS = [
  "Diagnose adoption friction",
  "Design the workflow system",
  "Enable teams with proof",
  "Measure trust and scale",
] as const;

export function waveBriefForLevel(level: number) {
  const index = Math.max(0, Math.min(CAMPAIGN_PHASES, level) - 1);
  return WAVE_BRIEFS[index];
}

export function isFinalPhase(level: number) {
  return level >= CAMPAIGN_PHASES;
}

export function phaseLabel(level: number) {
  return `Phase ${Math.min(level, CAMPAIGN_PHASES)}/${CAMPAIGN_PHASES}`;
}
