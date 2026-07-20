import { CAREERS_URL, REPO_URL } from "@/game/constants";

export const CHALLENGE_TITLE = "Artifact challenge";

export const CHALLENGE_BRIEF =
  "Fork Cursteroids and ship one adoption artifact sample — a Rules snippet, prompt architecture, MCP sketch, workflow guide, dashboard brief, Cloud Agent workflow, or enablement guide — that would help a real team make Cursor stick. Open a PR, or record a short Loom plus a written note on why the team would own it after you leave.";

export const CHALLENGE_RUBRIC = [
  {
    label: "Struggling moment",
    detail: "Names a real org/workflow gap, not a vague AI buzzword.",
  },
  {
    label: "Artifact specificity",
    detail: "Grounded in a codebase, stack, or team convention — not a generic tip sheet.",
  },
  {
    label: "Build-with ownership",
    detail: "Clear how the team would own and extend the artifact after you leave.",
  },
  {
    label: "Measurability",
    detail: "Hints at what would change (habits, cycle time, usage depth) if it worked.",
  },
  {
    label: "Shippability",
    detail: "Focused, typed, runnable with npm run dev — or a crisp Loom + written brief.",
  },
] as const;

export const CHALLENGE_SHARE_SEED =
  "I shipped a sample adoption artifact in Cursteroids for the AI Adoption Engineer role.";

export const RECRUITER_EVAL_NOTE =
  "Arcade score is not the hiring signal. Read the PR or Loom against the artifact rubric. Strong submissions look like Rules, prompts, MCP, dashboards, or workflow systems a real eng team could own — not event agendas or game reskins.";

export { CAREERS_URL, REPO_URL };
