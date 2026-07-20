import type { ModifierKind } from "@/game/types";

/**
 * Maps each intervention option string from `dialogue.ts`'s
 * `debriefQuestionsForPhase` to a concrete next-wave modifier. The mapping is
 * inferred from the option's intent: Rules-flavored choices pre-weaken the
 * next wave's most common blocker, MCP-flavored choices widen the Tab
 * suggestion cone, Cloud Agent-flavored choices bank an extra charge, and
 * dashboard/metric-flavored choices soften ROI drain.
 */
const INTERVENTION_MODIFIER_MAP: Record<string, ModifierKind> = {
  // Phase 1 — Diagnose
  "Repo-specific Rules library with the platform team": "rules",
  "Prompt architecture for their top incident / PR workflow": "mcp",
  "MCP into their knowledge base or JIRA": "mcp",
  "Adoption dashboard baseline with the eng manager": "dashboard",

  // Phase 2 — Design
  "Pair-draft Rules against real PRs": "rules",
  "Build a Cloud Agent for dependency audits": "cloud-agent",
  "Write a workflow guide for sprint kickoff + refactor": "cloud-agent",
  "Stand up MCP to monitoring / internal APIs": "mcp",

  // Phase 3 — Enable
  "Customer eng drives; you navigate": "cloud-agent",
  "Working session ends with merged Rules PR": "rules",
  "Champion runs the next office hours using your guide": "mcp",
  "Enablement guide for managers of the next squad": "dashboard",

  // Phase 4 — Measure & Scale
  "Package Rules + MCP + guide for the next squad": "rules",
  "Adoption dashboard in the QBR with ADM/CS": "dashboard",
  "Feed the pattern into Customer Education curriculum": "mcp",
  "Train champions to extend the artifact, not just use it": "cloud-agent",
};

/** Resolve a modifier for any intervention string, with a keyword fallback. */
export function modifierForIntervention(intervention: string): ModifierKind {
  const exact = INTERVENTION_MODIFIER_MAP[intervention];
  if (exact) {
    return exact;
  }

  const lower = intervention.toLowerCase();
  if (lower.includes("rule")) {
    return "rules";
  }
  if (lower.includes("mcp") || lower.includes("prompt") || lower.includes("workflow guide")) {
    return "mcp";
  }
  if (lower.includes("agent") || lower.includes("champion")) {
    return "cloud-agent";
  }
  if (lower.includes("dashboard") || lower.includes("metric") || lower.includes("roi")) {
    return "dashboard";
  }
  return "mcp";
}

/** Toast copy shown at the start of the wave the modifier applies to. */
export function modifierWaveToast(kind: ModifierKind, label: string | null): string {
  switch (kind) {
    case "rules":
      return label
        ? `Your Rules choice: "${label}" spawns pre-weakened this phase.`
        : "Your Rules choice: the next wave's top blocker spawns pre-weakened.";
    case "mcp":
      return "Your MCP choice: Tab suggestion range is widened this phase.";
    case "cloud-agent":
      return "Your Cloud Agent choice: +1 agent charge banked to start the phase.";
    case "dashboard":
      return "Your dashboard baseline: ROI drains are visible and weaker this phase.";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** Short HUD label for the currently active wave modifier. */
export function modifierHudLabel(kind: ModifierKind, label: string | null): string {
  switch (kind) {
    case "rules":
      return label ? `Rules: "${label}" pre-weakened` : "Rules coverage active";
    case "mcp":
      return "MCP: wider Tab range";
    case "cloud-agent":
      return "Cloud Agent: +1 charge";
    case "dashboard":
      return "Dashboard: drains weaker";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

/** One-line preview shown in the debrief right after the player answers. */
export function modifierPreviewText(kind: ModifierKind): string {
  switch (kind) {
    case "rules":
      return "Next phase: whatever blocker shows up most spawns pre-weakened.";
    case "mcp":
      return "Next phase: your Tab suggestion cone and range widen.";
    case "cloud-agent":
      return "Next phase: you start with +1 Cloud Agent charge banked.";
    case "dashboard":
      return "Next phase: ROI drains get a warning ring and drain 50% slower.";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
