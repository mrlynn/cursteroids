import { CAREERS_URL } from "@/game/constants";

/**
 * Ship pilot's daily standup.
 * A lightweight easter egg endpoint. Curiosity like this is how adoption engineers work.
 */
export async function GET() {
  return Response.json({
    pilot: "Captain Cursor (she/her)",
    date: new Date().toISOString().split("T")[0],
    yesterday: [
      "Cleared four adoption blockers across the campaign.",
      "Fielded three powerup drops (Rules, MCP, Dashboard). The team felt the difference.",
      "Watched low-trust-in-AI blocker take two hits. Trust rebuilds in layers.",
    ],
    today: [
      "Diagnosing legacy SDLC patterns in the next phase.",
      "Running build-with working sessions so the team owns what we ship.",
      "Measuring adoption depth: agent request volume, time-in-context vs generating.",
    ],
    blockers: [
      {
        label: "low trust in AI",
        hint: "Takes two hits. Trust is rebuilt in layers, not one demo.",
        intervention: "Rules library + paired review loops.",
      },
      {
        label: "unclear ROI",
        hint: "Drains Impact while it lives. Measure or lose the narrative.",
        intervention: "Dashboard. Track cycle time, test coverage, velocity.",
      },
      {
        label: "prompt sprawl",
        hint: "Fragment prompts need an owner.",
        intervention: "Centralized prompt repo + MCP config to enforce it.",
      },
    ],
    hiring: {
      role: "AI Adoption Engineer",
      url: CAREERS_URL,
      description:
        "Credibility from what you ship alongside the team, not from what you present to them.",
    },
    hint: "You found the standup endpoint by poking around. This is exactly the curiosity we hire for. The repo is the take-home artifact. github.com/mrlynn/cursteroids",
  });
}
