import type { AdoptionBlocker, BlockerMechanic } from "@/game/types";

/**
 * Adoption blockers. Distinctive mechanics live on a few labels so forkers
 * have a clear pattern to extend in `src/game/blockers.ts`.
 */
export const ADOPTION_BLOCKERS: AdoptionBlocker[] = [
  {
    label: "low trust in AI",
    fragments: ["bad prompts", "no review loop"],
    mechanic: "convert",
    hint: "Won't break — pair with it. Fly alongside it to bring it around.",
  },
  {
    label: "legacy SDLC",
    fragments: ["manual handoffs", "slow reviews"],
    mechanic: "none",
    hint: "Clear the handoffs before they multiply.",
  },
  {
    label: "no evals",
    fragments: ["vibes only", "unknown quality"],
    mechanic: "regen",
    hint: "Finish the eval before it heals. Half-measured quality comes back.",
  },
  {
    label: "prompt sprawl",
    fragments: ["stale snippets", "hidden context"],
    mechanic: "none",
    hint: "Fragment prompts need an owner.",
  },
  {
    label: "security review",
    fragments: ["policy gaps", "secret anxiety"],
    mechanic: "none",
    hint: "Policy gaps become secrets anxiety if left alone.",
  },
  {
    label: "tool overload",
    fragments: ["too many tabs", "unclear workflow"],
    mechanic: "none",
    hint: "Fewer tools, clearer path.",
  },
  {
    label: "unclear ROI",
    fragments: ["no baseline", "weak metrics"],
    mechanic: "drain",
    hint: "Drains Impact while it lives. Measure or lose the narrative.",
  },
  {
    label: "slow onboarding",
    fragments: ["tribal knowledge", "missing demos"],
    mechanic: "none",
    hint: "Tribal knowledge does not scale.",
  },
  {
    label: "context chaos",
    fragments: ["lost intent", "wrong files"],
    mechanic: "none",
    hint: "Lost intent shows up as wrong files.",
  },
  {
    label: "docs drift",
    fragments: ["old examples", "no owner"],
    mechanic: "none",
    hint: "Old examples train the wrong habits.",
  },
  {
    label: "CI failures",
    fragments: ["flaky tests", "slow feedback"],
    mechanic: "none",
    hint: "Flaky tests burn trust in the loop.",
  },
  {
    label: "IDE skepticism",
    fragments: ["old habits", "fear of change"],
    mechanic: "convert",
    hint: "Won't break — pair with it. Fly alongside it to bring it around.",
  },
];

export function getBlockerByLabel(label: string): AdoptionBlocker | undefined {
  return ADOPTION_BLOCKERS.find((item) => item.label === label);
}

export function getBlocker(index: number): AdoptionBlocker {
  return ADOPTION_BLOCKERS[index % ADOPTION_BLOCKERS.length];
}

export function hitPointsForMechanic(mechanic: BlockerMechanic): number {
  switch (mechanic) {
    case "armored":
      return 2;
    case "regen":
    case "drain":
    case "none":
      return 1;
    case "convert":
      // Never depleted by damage — bullets knock it back instead. The value
      // only matters for display parity with other blockers.
      return 1;
    default: {
      const _exhaustive: never = mechanic;
      return _exhaustive;
    }
  }
}

export const DISTINCTIVE_BLOCKERS = ADOPTION_BLOCKERS.filter(
  (blocker) => blocker.mechanic !== "none",
);
