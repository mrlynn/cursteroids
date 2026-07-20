import { CHALLENGE_SHARE_SEED } from "@/game/challenge";
import { BASE_PATH, CAMPAIGN_PHASES, CAREERS_URL } from "@/game/constants";
import { topArtifactFromDebriefs } from "@/game/dialogue";
import { encodeRunCode, type RunDimensionScores } from "@/game/encode";
import type { ProfileId } from "@/game/profiles";
import { AI_ADOPTION_ENGINEER_ROLE } from "@/game/roles/ai-adoption-engineer";
import type { GameSnapshot } from "@/game/types";

export type FitSharePayload = {
  headline: string;
  artifactLine: string;
  roleLine: string;
  shareText: string;
  /** Permalink to this run's shareable result page, when available. */
  runUrl?: string;
};

export function buildFitShareCard(input: {
  profileHeadline: string;
  artifact?: string | null;
  origin?: string;
  runUrl?: string;
}): FitSharePayload {
  const artifactLine = input.artifact
    ? `Artifact I'd ship: ${input.artifact}`
    : "Artifact I'd ship: a team-specific Rules library + ownership handoff";
  const roleLine = AI_ADOPTION_ENGINEER_ROLE.oneLiner;
  const origin =
    input.origin ||
    (typeof window !== "undefined"
      ? window.location.origin + BASE_PATH + "/"
      : "https://github.com/mrlynn/cursteroids");

  const shareText = [
    CHALLENGE_SHARE_SEED,
    input.profileHeadline,
    artifactLine,
    roleLine,
    "",
    input.runUrl ? `My run: ${input.runUrl}` : `Play Cursteroids: ${origin}`,
    `Apply: ${CAREERS_URL}`,
  ].join("\n");

  return {
    headline: input.profileHeadline,
    artifactLine,
    roleLine,
    shareText,
    runUrl: input.runUrl,
  };
}

export function fitShareFromGameSnapshot(
  snapshot: GameSnapshot,
  profileHeadline: string,
  origin = "",
  runUrl?: string,
): FitSharePayload {
  return buildFitShareCard({
    profileHeadline,
    artifact: topArtifactFromDebriefs(snapshot.debriefs),
    origin,
    runUrl,
  });
}

/** Loose keyword match from a debrief's leave-behind text to a role artifact,
 * so the run permalink can point at a specific artifact card without coupling
 * this module to scorecard.ts. */
const ARTIFACT_KEYWORDS: { id: string; pattern: RegExp }[] = [
  { id: "rules", pattern: /rule/i },
  { id: "prompts", pattern: /prompt/i },
  { id: "workflows", pattern: /workflow/i },
  { id: "dashboards", pattern: /dashboard|metric/i },
  { id: "mcp", pattern: /mcp/i },
  { id: "cloud_agents", pattern: /cloud agent/i },
  { id: "enablement", pattern: /enablement/i },
];

function guessTopArtifactIndex(leaveBehind: string | null): number {
  if (!leaveBehind) return -1;
  const match = ARTIFACT_KEYWORDS.find(({ pattern }) => pattern.test(leaveBehind));
  if (!match) return -1;
  return AI_ADOPTION_ENGINEER_ROLE.artifacts.findIndex((artifact) => artifact.id === match.id);
}

/**
 * Maps a finished GameSnapshot plus scorecard-style dimension scores into the
 * compact run-code payload from encode.ts. Scores are accepted as an argument
 * (rather than importing scorecard.ts) to avoid a dependency cycle — this
 * module stays dependency-light.
 */
export function buildRunCodeFromSnapshot(
  snapshot: GameSnapshot,
  profileId: ProfileId,
  dimensions: RunDimensionScores,
): string {
  return encodeRunCode({
    profileId,
    dimensions,
    phase: Math.min(CAMPAIGN_PHASES, Math.max(1, snapshot.level)),
    impact: Math.round(snapshot.score),
    completed: snapshot.status === "missionComplete",
    topArtifactIndex: guessTopArtifactIndex(topArtifactFromDebriefs(snapshot.debriefs)),
  });
}

/** Builds the shareable run URL for a given origin. The route lives under the
 * multi-zone base path, so the full shape is `<origin>/cursteroids/run/<code>`. */
export function buildRunUrl(code: string, origin = ""): string {
  const base =
    origin ||
    (typeof window !== "undefined"
      ? window.location.origin + BASE_PATH
      : "https://github.com/mrlynn/cursteroids");
  return `${base.replace(/\/$/, "")}/run/${code}`;
}

/** Short (under 3 line) share blurb for a run permalink. */
export function buildRunShareText(profileName: string, url: string): string {
  return [`I'm a ${profileName} in Cursteroids.`, "The job description you can play.", url].join("\n");
}
