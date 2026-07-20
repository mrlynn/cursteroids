import { CAMPAIGN_PHASES } from "@/game/constants";

export const WAVE_BRIEFS = [
  "Diagnose — read the engineering org",
  "Design — build the intervention",
  "Enable — ship it with the team",
  "Measure & Scale — prove and systematize",
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
