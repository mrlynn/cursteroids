import { WAVE_BRIEFS } from "@/game/campaign";

export type PhaseDebrief = {
  phase: number;
  phaseLabel: string;
  strugglingMoment: string;
  intervention: string;
  leaveBehind: string;
  note?: string;
};

export type DebriefQuestion = {
  id: "strugglingMoment" | "intervention" | "leaveBehind";
  prompt: string;
  options: string[];
};

export function debriefQuestionsForPhase(phase: number): DebriefQuestion[] {
  const brief = WAVE_BRIEFS[Math.max(0, Math.min(WAVE_BRIEFS.length, phase) - 1)];

  switch (phase) {
    case 1:
      return [
        {
          id: "strugglingMoment",
          prompt: `${brief}: Where is capability furthest from practice?`,
          options: [
            "Seniors distrust AI output; no review loop",
            "Every squad invents its own Cursor setup",
            "Agent Mode blocked; Tab-only with no path forward",
            "Leadership wants ROI before anyone changes habits",
          ],
        },
        {
          id: "intervention",
          prompt: "What do you design first?",
          options: [
            "Repo-specific Rules library with the platform team",
            "Prompt architecture for their top incident / PR workflow",
            "MCP into their knowledge base or JIRA",
            "Adoption dashboard baseline with the eng manager",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What should the next team start from — not scratch?",
          options: [
            "Checked-in .cursorrules + example PR",
            "Prompt framework in their vocabulary",
            "MCP config + short ownership doc",
            "One metric the VP can track weekly",
          ],
        },
      ];
    case 2:
      return [
        {
          id: "strugglingMoment",
          prompt: `${brief}: What makes a generic best-practices doc fail here?`,
          options: [
            "Their monorepo conventions are unique",
            "Security needs allowlists before Agent Mode",
            "On-call handoffs are the real pain, not demos",
            "No owner for any AI-assisted workflow",
          ],
        },
        {
          id: "intervention",
          prompt: "How do you close the gap in their codebase?",
          options: [
            "Pair-draft Rules against real PRs",
            "Build a Cloud Agent for dependency audits",
            "Write a workflow guide for sprint kickoff + refactor",
            "Stand up MCP to monitoring / internal APIs",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What artifact proves the design, not the session?",
          options: [
            "Rules + review checklist the team edits",
            "Cloud Agent running with a handoff doc",
            "Workflow guide reproducible without you",
            "Prompt pack for incident investigation",
          ],
        },
      ];
    case 3:
      return [
        {
          id: "strugglingMoment",
          prompt: `${brief}: What burns Trust when you enable badly?`,
          options: [
            "Building in front of them instead of with them",
            "Overclaiming Agent Mode live",
            "Leaving without a named owner for the artifact",
            "No practice date after the working session",
          ],
        },
        {
          id: "intervention",
          prompt: "How do you ship so they own it?",
          options: [
            "Customer eng drives; you navigate",
            "Working session ends with merged Rules PR",
            "Champion runs the next office hours using your guide",
            "Enablement guide for managers of the next squad",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What evidence shows practice started?",
          options: [
            "Merged PR using the new workflow",
            "Two squads using the same Rules base",
            "Agent request volume moved on the dashboard",
            "Manager scheduled rollout using your enablement guide",
          ],
        },
      ];
    case 4:
    default:
      return [
        {
          id: "strugglingMoment",
          prompt: `${brief}: What dies when you only help one team?`,
          options: [
            "Neighboring teams never see the artifact",
            "Metrics never leave the slide deck",
            "No owner after you rotate off",
            "Learnings never reach Cursor's playbook",
          ],
        },
        {
          id: "intervention",
          prompt: "How do you turn the win into a system?",
          options: [
            "Package Rules + MCP + guide for the next squad",
            "Adoption dashboard in the QBR with ADM/CS",
            "Feed the pattern into Customer Education curriculum",
            "Train champions to extend the artifact, not just use it",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What makes this permanent practice?",
          options: [
            "Cadence + owner for the next 30 days",
            "Shared metrics the account can run without you",
            "Artifact pack checked into their docs repo",
            "Playbook update Cursor can reuse on the next account",
          ],
        },
      ];
  }
}

export type DeskChoice = {
  id: string;
  label: string;
  coach: string;
  teach: string;
};

export type DeskTurn = {
  id: string;
  from: "ADM" | "Coach";
  message: string;
  choices: DeskChoice[];
};

/** Scripted Account Desk — artifact decisions for a stalled enterprise rollout. */
export const ACCOUNT_DESK_TURNS: DeskTurn[] = [
  {
    id: "stalled-pilot",
    from: "ADM",
    message:
      "Pilot looked good two weeks ago. Usage flatlined. Platform eng says demos feel like theater. What do you ship first?",
    choices: [
      {
        id: "rules",
        label: "Draft a repo-specific Rules library with the platform team",
        coach:
          "Strong open. Credibility comes from what you build in their conventions, not another demo. Make them co-authors of the Rules PR.",
        teach: "Rules libraries encode team standards so adoption sticks beyond the room.",
      },
      {
        id: "mcp",
        label: "Stand up an MCP to their knowledge base or JIRA",
        coach:
          "Good when the gap is context, not motivation. An assistant that knows the business beats a generic chat.",
        teach: "MCP turns Cursor from a coding toy into a system that sees their world.",
      },
      {
        id: "cloud-agent",
        label: "Ship a Cloud Agent for dependency audits on a real repo",
        coach:
          "Works if you hand it off documented and running. Automation they own beats a heroic session.",
        teach: "Cloud Agent workflows are permanent practice when the team keeps them alive.",
      },
      {
        id: "dashboard",
        label: "Build an adoption dashboard baseline with the eng manager",
        coach:
          "Right when leadership is flying blind. Measure depth before you scale theater.",
        teach: "Dashboards make the story data, not sentiment.",
      },
    ],
  },
  {
    id: "vp-roi",
    from: "ADM",
    message:
      "VP Eng wants proof by Friday. They will sit for 20 minutes. How do you spend that time?",
    choices: [
      {
        id: "metric",
        label: "Show baseline → improved metric from the dashboard",
        coach:
          "Best if you already instrumented something real. Vague velocity claims burn Trust.",
        teach: "Measure proves the change. Leadership stories need numbers.",
      },
      {
        id: "rules-pr",
        label: "Walk a merged Rules PR the team already owns",
        coach:
          "High credibility. You are showing permanent practice, not a slide.",
        teach: "Ship alongside the team — then show what they kept.",
      },
      {
        id: "live-build",
        label: "Live-build a prompt architecture on their open incident",
        coach:
          "High Trust if a customer eng drives. Overclaiming Agent Mode live is how you lose the room.",
        teach: "Enable means build with them, not perform in front of them.",
      },
      {
        id: "deck",
        label: "Present a polished enablement deck and roadmap",
        coach:
          "Weak default for this role. Decks without artifacts read as consulting theater.",
        teach: "Credibility comes from what you ship, not what you present.",
      },
    ],
  },
  {
    id: "security-block",
    from: "ADM",
    message:
      "Security paused Agent Mode. Devs still have Tab. Half the room checked out. Next artifact?",
    choices: [
      {
        id: "rules-allowlist",
        label: "Co-design Rules + allowlist path with Security",
        coach:
          "Turns the block into a control you build together. Constraint clarity beats waiting.",
        teach: "Design the intervention for the real constraint, not the fantasy stack.",
      },
      {
        id: "workflow-tab",
        label: "Ship a Tab-first workflow guide for on-call handoffs",
        coach:
          "Pragmatic. Keep practice alive where policy allows; document the Agent path for later.",
        teach: "Workflow guides make thinner practice loops reproducible.",
      },
      {
        id: "mcp-safe",
        label: "MCP only to approved internal read-only systems",
        coach:
          "Smart compromise when context is the pain and Agent is blocked.",
        teach: "MCP configurations can expand value inside the policy envelope.",
      },
      {
        id: "pause",
        label: "Pause all enablement until Agent Mode returns",
        coach:
          "Usually wrong. Adoption dies in vacuums. Leave a thinner artifact loop running.",
        teach: "Permanent practice beats waiting for the perfect tool state.",
      },
    ],
  },
  {
    id: "scale-signal",
    from: "ADM",
    message:
      "One squad is crushing it. Three neighboring teams have not started. What do you leave behind?",
    choices: [
      {
        id: "artifact-pack",
        label: "Package Rules + MCP + enablement guide for the next squad",
        coach:
          "Strong scale move. The next team starts from your work, not from scratch.",
        teach: "Scale means systems other teams can replicate.",
      },
      {
        id: "feed-edu",
        label: "Feed the pattern into Customer Education curriculum",
        coach:
          "Right long game. Field signal should change how Cursor designs programs.",
        teach: "The best practitioners help every team that comes after them.",
      },
      {
        id: "dashboard-qbr",
        label: "Put adoption depth on the QBR dashboard with ADM/CS",
        coach:
          "Makes expansion a data conversation, not cheerleading.",
        teach: "Measure at team level so scale decisions are grounded.",
      },
      {
        id: "more-demos",
        label: "Book demos for each remaining team this month",
        coach:
          "Activity trap. Demos without owned artifacts recreate the stalled pilot.",
        teach: "Events are optional. Artifacts and habits are the job.",
      },
    ],
  },
];

export function formatDebriefsForShare(debriefs: PhaseDebrief[]): string {
  if (debriefs.length === 0) {
    return "";
  }
  return debriefs
    .map((d) => `Phase ${d.phase}: ${d.intervention} · leave behind: ${d.leaveBehind}`)
    .join("\n");
}

export function topArtifactFromDebriefs(debriefs: PhaseDebrief[]): string | null {
  if (debriefs.length === 0) {
    return null;
  }
  return debriefs[debriefs.length - 1]?.leaveBehind ?? null;
}
