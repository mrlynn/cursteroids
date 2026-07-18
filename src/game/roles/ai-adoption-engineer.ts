/**
 * Canonical AI Adoption Engineer role brief used for resume feedback.
 * Keep this aligned with the public posting.
 */
export const AI_ADOPTION_ENGINEER_ROLE = {
  id: "ai-adoption-engineer",
  title: "AI Adoption Engineer",
  team: "Customer Education",
  employment: "Full-time IC",
  locations: "EMEA Remote, San Francisco, CA or New York, NY",
  reportsTo: "VP of Customer Education",
  careersUrl: "https://cursor.com/careers/ai-adoption-engineer",
  about: [
    "Buying Cursor is easy. Changing how a 5000-person engineering organization builds software is hard. This role bridges that gap.",
    "As an AI Adoption Engineer, you are the person who shows up after the contract is signed and makes adoption real. You design and run the hackathons, facilitate the Customer Developer Days, build the internal champions, and create the conditions for engineering teams to genuinely shift how they work with AI. You are not a trainer delivering slides. You are a practitioner who makes things happen in the room.",
    "This is a post-sales, customer-facing IC role. You will work closely with AI Deployment Managers and Customer Success to identify where adoption is stalling and design high-touch, experiential interventions that move it forward. Your success is measured by whether developers actually change how they build, not by how many events you run.",
  ].join("\n\n"),
  whatYoullDo: [
    "Design, produce, and run internal hackathons within customer organizations: company-specific formats, cohort-based programs, single-day sprints, multi-day builds, and theme-based challenges",
    "Build and own the Customer Developer Day program: immersive half-day or full-day events designed for specific accounts or customer segments",
    "Develop the facilitation infrastructure that makes these programs repeatable: playbooks, judging rubrics, agenda frameworks, and post-event retrospective templates",
    "Partner with AI Deployment Managers and Customer Success to identify the right intervention for each account: which customers need a hackathon, which need a structured workshop, which need something else entirely",
    "Capture outcomes from every engagement and turn them into customer success stories for internal account teams and for broader Cursor storytelling",
    "Identify patterns across customer engagements and feed them back into how the broader Customer Education team designs programs and content",
    "Be a credible technical presence in the room with developers: you can follow a codebase, troubleshoot in real time, and demonstrate Cursor capabilities at a level that earns developer trust",
  ],
  mayBeAFitIf: [
    "You have experience running developer events, hackathons, or technical workshops and can point to adoption outcomes that followed",
    "You are technical enough to be credible with experienced engineers. You use Cursor or comparable AI coding tools in your own workflow and have genuine opinions about what good AI-assisted development looks like.",
    "You understand the difference between a great event and a great adoption program. Events are a mechanism. Behavior change is the goal.",
    "You are energized by being in the room with customers, not behind a content warehouse. You do your best work when the stakes are live.",
    "You have worked in a post-sales or customer success context and understand how to operate within account relationships without disrupting them",
    "You are a strong communicator and facilitator. You can hold the attention of a room of skeptical engineers and also sit across from a VP of Engineering and explain why this matters.",
    "You use AI tools as core infrastructure in how you work, not as a novelty",
  ],
  strongCandidatesMayAlsoHave: [
    "Prior experience in developer relations, developer advocacy, or technical customer success",
    "Background in instructional design, facilitation, or learning science",
    "Experience at a developer tools company: IDE, API platform, DevOps, or AI tooling",
    "Familiarity with enterprise engineering environments: how decisions get made, how rollouts happen, where adoption stalls",
    "Content creation experience: technical writing, video tutorials, or live coding sessions",
  ],
} as const;

export const RESUME_FIT_DIMENSIONS = [
  {
    id: "facilitation",
    label: "Facilitation & live events",
    description:
      "Evidence of running hackathons, workshops, Developer Days, or similar live technical programs — and outcomes that followed.",
  },
  {
    id: "technical_credibility",
    label: "Technical credibility",
    description:
      "Can earn trust with experienced engineers: codebase fluency, AI coding tools in real workflow, ability to demo and troubleshoot live.",
  },
  {
    id: "behavior_change",
    label: "Adoption / behavior change",
    description:
      "Treats events as mechanisms. Shows programs that changed how people work, not just attendance or content shipped.",
  },
  {
    id: "systems_playbooks",
    label: "Systems & repeatability",
    description:
      "Builds playbooks, rubrics, agendas, retros — facilitation infrastructure that scales beyond one heroic session.",
  },
  {
    id: "customer_context",
    label: "Post-sales / customer context",
    description:
      "Operates inside account relationships with CS/Deployment partners without disrupting the commercial motion.",
  },
  {
    id: "communication",
    label: "Communication range",
    description:
      "Holds a room of skeptical engineers and can also explain the why to a VP of Engineering.",
  },
] as const;

export type ResumeFitDimensionId = (typeof RESUME_FIT_DIMENSIONS)[number]["id"];

export function buildRoleRubricPrompt(): string {
  const role = AI_ADOPTION_ENGINEER_ROLE;
  return [
    `Role: ${role.title}`,
    `Team: ${role.team} · ${role.employment} · ${role.locations}`,
    `Reports to: ${role.reportsTo}`,
    "",
    "About the role:",
    role.about,
    "",
    "What you'll do:",
    ...role.whatYoullDo.map((item) => `- ${item}`),
    "",
    "You may be a fit if:",
    ...role.mayBeAFitIf.map((item) => `- ${item}`),
    "",
    "Strong candidates may also have:",
    ...role.strongCandidatesMayAlsoHave.map((item) => `- ${item}`),
    "",
    "Evaluation dimensions:",
    ...RESUME_FIT_DIMENSIONS.map(
      (dimension) => `- ${dimension.id} (${dimension.label}): ${dimension.description}`,
    ),
  ].join("\n");
}
