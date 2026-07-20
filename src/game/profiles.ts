/**
 * Builder identity profiles for shareable run results.
 *
 * Mirrors the headline logic in `src/game/scorecard.ts` (`headlineFor`) without
 * importing it, so this module stays dependency-light and safe to use from
 * both server routes (`src/app/run/[code]`) and the encode/decode layer.
 *
 * Dimension ids intentionally match scorecard.ts's `ScoreDimension["id"]`:
 * "diagnosis" | "trust" | "systems" | "tools".
 */

export type ProfileDimensionId = "diagnosis" | "trust" | "systems" | "tools";

export type ProfileId =
  | "trust-guardian"
  | "workflow-diagnoser"
  | "systems-operator"
  | "enablement-operator"
  | "adoption-systems-builder"
  | "ai-change-agent";

export type BuilderProfile = {
  id: ProfileId;
  /** Display name used for headlines, e.g. "Trust Guardian". */
  name: string;
  /** One witty sentence in a dry senior-engineer voice. */
  tagline: string;
  /** Short line naming what the run demonstrated. */
  strengthLine: string;
  /** The scorecard dimension this profile is keyed off, or null for the
   * mission-complete and fallback profiles which are not dimension-specific. */
  dimension: ProfileDimensionId | null;
};

/** Ordered so array index doubles as a compact encoding for `encode.ts`. */
export const PROFILE_ORDER: ProfileId[] = [
  "trust-guardian",
  "workflow-diagnoser",
  "systems-operator",
  "enablement-operator",
  "adoption-systems-builder",
  "ai-change-agent",
];

export const PROFILES: Record<ProfileId, BuilderProfile> = {
  "trust-guardian": {
    id: "trust-guardian",
    name: "Trust Guardian",
    tagline: "You kept the room's confidence intact, which is rarer than it sounds and worth more than a demo.",
    strengthLine: "Protected Trust under pressure instead of spending it for a quick win.",
    dimension: "trust",
  },
  "workflow-diagnoser": {
    id: "workflow-diagnoser",
    name: "Workflow Diagnoser",
    tagline: "You went after the distinctive blockers, not the easy rocks everyone else clears first.",
    strengthLine: "Found low trust in AI, missing evals, and unclear ROI — the blockers that actually matter.",
    dimension: "diagnosis",
  },
  "systems-operator": {
    id: "systems-operator",
    name: "Systems Operator",
    tagline: "You ran the role loop like a system engineer, not like someone improvising a demo.",
    strengthLine: "Moved through Diagnose to Design to Enable to Scale without losing the thread.",
    dimension: "systems",
  },
  "enablement-operator": {
    id: "enablement-operator",
    name: "Enablement Operator",
    tagline: "You reached for Rules, MCP, Cloud Agent, or Dashboard exactly when the wave needed it.",
    strengthLine: "Deployed adoption artifacts on schedule instead of hoarding them.",
    dimension: "tools",
  },
  "adoption-systems-builder": {
    id: "adoption-systems-builder",
    name: "Adoption Systems Builder",
    tagline: "You cleared all four phases. The hiring signal was never the score — it's what you build next.",
    strengthLine: "Completed the full Diagnose → Design → Enable → Scale loop.",
    dimension: null,
  },
  "ai-change-agent": {
    id: "ai-change-agent",
    name: "AI Change Agent",
    tagline: "Early days. Every senior engineer on this team started with a rough first run too.",
    strengthLine: "Took the first pass at the adoption loop.",
    dimension: null,
  },
} as const;

/**
 * Replicates `headlineFor`'s top-dimension logic from scorecard.ts: complete
 * mission wins outright, otherwise the highest-scoring dimension picks the
 * profile, falling back to the generic change-agent profile.
 */
export function profileForDimensions(
  dimensions: { id: ProfileDimensionId; score: number }[],
  completedMission: boolean,
): BuilderProfile {
  if (completedMission) {
    return PROFILES["adoption-systems-builder"];
  }
  const top = [...dimensions].sort((a, b) => b.score - a.score)[0];
  switch (top?.id) {
    case "diagnosis":
      return PROFILES["workflow-diagnoser"];
    case "trust":
      return PROFILES["trust-guardian"];
    case "systems":
      return PROFILES["systems-operator"];
    case "tools":
      return PROFILES["enablement-operator"];
    default:
      return PROFILES["ai-change-agent"];
  }
}

export function profileById(id: string | null | undefined): BuilderProfile {
  if (id && Object.prototype.hasOwnProperty.call(PROFILES, id)) {
    return PROFILES[id as ProfileId];
  }
  return PROFILES["ai-change-agent"];
}

export function profileIndex(id: ProfileId): number {
  const index = PROFILE_ORDER.indexOf(id);
  return index === -1 ? PROFILE_ORDER.indexOf("ai-change-agent") : index;
}

export function profileIdFromIndex(index: number): ProfileId {
  return PROFILE_ORDER[index] ?? "ai-change-agent";
}
