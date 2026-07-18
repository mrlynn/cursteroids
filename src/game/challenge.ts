import { CAREERS_URL, REPO_URL } from "@/game/constants";

export const CHALLENGE_TITLE = "Builder challenge";

export const CHALLENGE_BRIEF =
  "Fork Cursteroids and make one adoption blocker more interesting — as a mechanic or a teaching moment. Open a PR, or record a short Loom plus a written note on why this helps a team adopt Cursor.";

export const CHALLENGE_RUBRIC = [
  {
    label: "Struggling moment",
    detail: "Names a real adoption friction, not a vague AI buzzword.",
  },
  {
    label: "Mechanic quality",
    detail: "The blocker behaves differently in play, or teaches a clear Cursor workflow.",
  },
  {
    label: "Teaching value",
    detail: "A teammate could explain the lesson after one run.",
  },
  {
    label: "Taste and restraint",
    detail: "Small, shippable change. No feature pile-on.",
  },
  {
    label: "Shippability",
    detail: "PR is focused, typed, and runnable with npm run dev.",
  },
] as const;

export const RECRUITER_EVAL_NOTE =
  "Arcade score is not the hiring signal. Read the PR or Loom against the rubric above. Strong submissions make one blocker concrete and show how the candidate thinks about enablement.";

export { CAREERS_URL, REPO_URL };
