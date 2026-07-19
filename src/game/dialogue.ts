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
          prompt: `${brief}: What friction showed up first?`,
          options: [
            "Skeptical seniors who do not trust AI output",
            "No shared definition of good prompts / workflows",
            "Leadership wants ROI before anyone changes habits",
            "Tool sprawl — everyone inventing their own Cursor setup",
          ],
        },
        {
          id: "intervention",
          prompt: "What intervention fits this room?",
          options: [
            "Live hackathon with a real backlog ticket",
            "Structured workshop with a clear before/after",
            "Champion 1:1s before any big event",
            "Ship a playbook first, then gather the room",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What should still work after you leave?",
          options: [
            "A named champion + office hours cadence",
            "An eval / review loop for AI-assisted PRs",
            "A one-page workflow playbook for the team",
            "A baseline metric the VP can track weekly",
          ],
        },
      ];
    case 2:
      return [
        {
          id: "strugglingMoment",
          prompt: `${brief}: Where does the design usually fail?`,
          options: [
            "Great demo, zero habit change the next Monday",
            "Rules / prompts exist but nobody owns them",
            "Security blocks Agent Mode without a path forward",
            "Each squad invents a different workflow",
          ],
        },
        {
          id: "intervention",
          prompt: "How do you make the workflow durable?",
          options: [
            "Codify Rules + review checklist with the team",
            "Pair on one production path until it sticks",
            "Design a Customer Developer Day around their repo",
            "Build a tiny eval harness before scaling demos",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What artifact proves the system, not the session?",
          options: [
            "Team Rules file + example PR",
            "Judging rubric for hackathon outcomes",
            "Agenda + retro template others can rerun",
            "Champion kit: talk track, FAQ, escalation path",
          ],
        },
      ];
    case 3:
      return [
        {
          id: "strugglingMoment",
          prompt: `${brief}: What burns Trust in the room?`,
          options: [
            "Overclaiming what Agent Mode can do live",
            "Ignoring the skeptic who asks about review",
            "Optimizing for applause instead of a shipped change",
            "Leaving without a next practice date",
          ],
        },
        {
          id: "intervention",
          prompt: "How do you enable without becoming the hero?",
          options: [
            "Have a customer eng drive the laptop",
            "Time-box demos; spend the rest on their ticket",
            "Coach champions to run the next session",
            "Capture the win as a story ADM/CS can reuse",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What evidence shows behavior started to change?",
          options: [
            "Merged PR that used the new workflow",
            "Two champions scheduled to run office hours",
            "Team agreed eval criteria for AI-assisted work",
            "VP saw a before/after on a real metric",
          ],
        },
      ];
    case 4:
    default:
      return [
        {
          id: "strugglingMoment",
          prompt: `${brief}: What usually dies at scale?`,
          options: [
            "One team wins; neighboring teams never hear",
            "No owner for the playbook after the event",
            "Metrics never leave the slide deck",
            "Content ships but nobody practices",
          ],
        },
        {
          id: "intervention",
          prompt: "How do you scale without watering it down?",
          options: [
            "Turn the win into a repeatable Customer Developer Day",
            "Feed patterns back to Customer Education curriculum",
            "Train champions to facilitate, not just use Cursor",
            "Set a weekly adoption pulse with ADM/CS",
          ],
        },
        {
          id: "leaveBehind",
          prompt: "What makes this an adoption program, not an event?",
          options: [
            "Cadence on the calendar for the next 30 days",
            "Shared metrics dashboard the account can own",
            "Playbook + rubric checked into their docs",
            "A named internal owner with ADM backup",
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

/** Scripted Account Desk — simulated ADM huddle about a stalled rollout. */
export const ACCOUNT_DESK_TURNS: DeskTurn[] = [
  {
    id: "stalled-pilot",
    from: "ADM",
    message:
      "Pilot looked good two weeks ago. Usage flatlined. Platform eng says demos feel like theater. What do you run?",
    choices: [
      {
        id: "hackathon",
        label: "Internal hackathon on a real backlog ticket",
        coach:
          "Solid if you can get a real ticket and a judging bar. Events are a mechanism — pick one outcome that proves habit change.",
        teach: "AAEs design experiential interventions, not slide decks.",
      },
      {
        id: "workshop",
        label: "Structured half-day workshop with before/after",
        coach:
          "Good when the team needs a shared workflow more than adrenaline. Make the before/after observable or it dies Monday.",
        teach: "Workshops win when the struggling moment is skill + process, not motivation.",
      },
      {
        id: "champions",
        label: "Champion 1:1s before any big event",
        coach:
          "Often the right first move with skeptics. Build internal credibility, then let champions fill the room.",
        teach: "Trust is rebuilt in layers. Champions are how adoption survives after you leave.",
      },
      {
        id: "content",
        label: "Send a tighter enablement pack and check usage",
        coach:
          "Weak default. Content without a live practice loop rarely moves a stalled pilot. Use content to support an intervention, not replace it.",
        teach: "Behavior change is the goal. Content is infrastructure for practice.",
      },
    ],
  },
  {
    id: "vp-roi",
    from: "ADM",
    message:
      "VP Eng wants an ROI story by Friday. They will sit in for 20 minutes. How do you spend that time?",
    choices: [
      {
        id: "metric",
        label: "Show one baseline → one improved workflow metric",
        coach:
          "Best move if you already instrumented something. Vague velocity claims burn Trust with VPs.",
        teach: "Unclear ROI drains the narrative. Measure or lose the room.",
      },
      {
        id: "live-pr",
        label: "Live-resolve a skeptical eng's open PR with Cursor",
        coach:
          "High Trust if it works; high risk if you overclaim. Have a review loop ready when they ask about quality.",
        teach: "Credibility is earned in the codebase, not the slide.",
      },
      {
        id: "roadmap",
        label: "Present a 30-day adoption program plan",
        coach:
          "Works when they need a system, not a miracle. Tie each week to an owner and a behavior, not event count.",
        teach: "Programs beat one-off wins. Cadence is the product.",
      },
      {
        id: "defer",
        label: "Ask for two more weeks before any executive readout",
        coach:
          "Sometimes honest. Only if you name what you will prove in those two weeks. Silence looks like stall.",
        teach: "Operate inside the account relationship — do not surprise CS/ADM with a no-show.",
      },
    ],
  },
  {
    id: "security-block",
    from: "ADM",
    message:
      "Security paused Agent Mode. Devs still have Tab. Half the room checked out. Next move?",
    choices: [
      {
        id: "rules-path",
        label: "Facilitate a Rules + allowlist workshop with Security",
        coach:
          "Turns the block into a co-design session. You are building constraint clarity, not fighting the gate.",
        teach: "Rules encode guardrails so teams stop renegotiating every prompt.",
      },
      {
        id: "tab-depth",
        label: "Double down on Tab workflows until Agent is unblocked",
        coach:
          "Pragmatic. Keep momentum where policy allows, and document the Agent path for when it opens.",
        teach: "Right intervention for the constraint — not the fantasy stack.",
      },
      {
        id: "escalate",
        label: "Escalate to unblock Agent Mode this week",
        coach:
          "Only if Safety risk is overstated and ADM agrees. Escalation without a proposed control set burns political capital.",
        teach: "Post-sales work means protecting the account relationship while pushing adoption.",
      },
      {
        id: "pause",
        label: "Pause enablement until Agent Mode returns",
        coach:
          "Usually wrong. Adoption dies in vacuums. Keep a thinner practice loop alive.",
        teach: "Success is whether developers change how they build — even under constraint.",
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
        id: "dev-day",
        label: "Customer Developer Day the winning squad helps facilitate",
        coach:
          "Strong scale move. The win becomes a program other teams can enter, not a legend they hear about.",
        teach: "Build facilitation infrastructure others can rerun.",
      },
      {
        id: "feed-edu",
        label: "Write the pattern back into Customer Education curriculum",
        coach:
          "Right long game. Your field signal should change how the broader education team designs content.",
        teach: "AAEs identify patterns across engagements and feed the system.",
      },
      {
        id: "champions-network",
        label: "Stand up a cross-team champion guild with office hours",
        coach:
          "Scales trust sideways. Needs a light operating rhythm or it becomes Slack noise.",
        teach: "Champions are how enablement survives without you in the room.",
      },
      {
        id: "more-demos",
        label: "Book demos for each remaining team this month",
        coach:
          "Activity trap. Demos without owners and practice loops recreate the stalled pilot.",
        teach: "Events are a mechanism. Behavior change is the goal.",
      },
    ],
  },
];

export function formatDebriefsForShare(debriefs: PhaseDebrief[]): string {
  if (debriefs.length === 0) {
    return "";
  }
  return debriefs
    .map(
      (d) =>
        `Phase ${d.phase}: ${d.intervention} · leave behind: ${d.leaveBehind}`,
    )
    .join("\n");
}
