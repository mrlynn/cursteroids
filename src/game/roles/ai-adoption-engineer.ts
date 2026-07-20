/**
 * Canonical AI Adoption Engineer role content.
 * Single source of truth for page copy, resume feedback, and coaching.
 */
export const AI_ADOPTION_ENGINEER_ROLE = {
  id: "ai-adoption-engineer",
  title: "AI Adoption Engineer",
  team: "Customer Education",
  employment: "Full-time IC",
  locations: "EMEA Remote, San Francisco, CA or New York, NY",
  careersUrl: "https://cursor.com/careers/ai-adoption-engineer",
  oneLiner: "Credibility from what you ship alongside the team, not from what you present to them.",
  whoThrivesCta:
    "If the role loop above sounds like what you already do informally, we should talk.",
  about: [
    "You work directly inside enterprise engineering teams to turn AI pilots into permanent practice.",
    "Not as a trainer. Not as a consultant who delivers decks and leaves. You build the things that make adoption stick: the Rules libraries that encode team conventions, the prompt architectures that match how a specific codebase works, the workflow patterns that let engineers use agents without breaking what they know.",
    "Your credibility comes from what you ship alongside the team, not from what you present to them.",
    "The job is part technical architect, part systems thinker, part change practitioner. You need to read an engineering org fast, identify where AI capability and existing workflow are misaligned, and build the bridge. Then document it well enough that the next team can start from your work, not from scratch.",
    "This is a role for people who have been builders and want to use that background to change how entire organizations work.",
  ].join("\n\n"),
  roleLoop: [
    {
      id: "diagnose",
      label: "Diagnose",
      title: "Read the engineering org",
      detail:
        "Understand the team's stack, delivery patterns, trust level with AI, and where the gap between capability and practice is widest — through working sessions, PR history, and listening, not surveys.",
    },
    {
      id: "design",
      label: "Design",
      title: "Build the intervention",
      detail:
        "Draft the Rules library, prompt framework, workflow template, or MCP configuration that closes the gap. Technical, specific, grounded in their codebase — not a generic best-practices doc.",
    },
    {
      id: "enable",
      label: "Enable",
      title: "Ship it with the team",
      detail:
        "Run working sessions where you build with engineers, not in front of them. By the end, the team owns what you built together.",
    },
    {
      id: "measure",
      label: "Measure",
      title: "Prove the change",
      detail:
        "Track what actually changed: PR cycle time, test coverage, agent request volume, time in context vs generating. Ground the leadership story in data, not sentiment.",
    },
    {
      id: "scale",
      label: "Scale",
      title: "Turn wins into systems",
      detail:
        "Document what worked so the customer can replicate across teams. Feed learnings into Cursor's playbook so the next engagement starts ahead.",
    },
  ],
  artifacts: [
    {
      id: "rules",
      label: "Rules libraries",
      detail:
        "Team- and repo-specific .cursorrules that encode standards, review conventions, and domain context — different for a fintech monorepo vs a legacy Java codebase.",
    },
    {
      id: "prompts",
      label: "Prompt architectures",
      detail:
        "Structured frameworks for high-frequency tasks: incident investigation, PR review, test generation, architecture docs — in the team's vocabulary and toolchain.",
    },
    {
      id: "workflows",
      label: "Workflow guides",
      detail:
        "Step-by-step docs for real SDLC motions: sprint kickoffs, on-call handoffs, large refactors. Reproducible by someone who was not in the room.",
    },
    {
      id: "dashboards",
      label: "Adoption dashboards",
      detail:
        "Usage reporting with eng leaders: adoption depth, agent trends, feature utilization. Used in QBRs and internal eng communications.",
    },
    {
      id: "mcp",
      label: "MCP configurations",
      detail:
        "Model Context Protocol setups connecting Cursor to knowledge bases, JIRA, internal APIs, monitoring — an AI that knows the business.",
    },
    {
      id: "cloud_agents",
      label: "Cloud Agent workflows",
      detail:
        "Automated jobs for common work: security scans, dependency audits, docs updates, CI checks — handed off documented and running.",
    },
    {
      id: "enablement",
      label: "Enablement guides",
      detail:
        "Onboarding for eng managers rolling Cursor to new squads, built from what worked at this customer — not generic docs.",
    },
  ],
  whoThrives: [
    "Usually senior engineers or staff-level DevEx practitioners who watched good tooling fail because nobody built the right habits around it.",
    "Practical. Earn trust by doing. Find patterns across complex systems.",
  ],
} as const;

export const RESUME_FIT_DIMENSIONS = [
  {
    id: "technical_architecture",
    label: "Technical architecture",
    description:
      "Shipped conventions, tooling, or DevEx systems in real codebases — not slideware.",
  },
  {
    id: "systems_thinking",
    label: "Systems thinking",
    description:
      "Diagnoses org/workflow gaps and designs specific bridges between AI capability and existing practice.",
  },
  {
    id: "build_with_enablement",
    label: "Build-with enablement",
    description:
      "Pairing and working sessions where the team owns the artifact after you leave — not demos in front of them.",
  },
  {
    id: "measurement",
    label: "Measurement",
    description:
      "Evidence of tracking adoption or delivery outcomes (cycle time, usage depth, quality) — data over sentiment.",
  },
  {
    id: "artifact_craft",
    label: "Artifact craft",
    description:
      "Rules, prompts, docs, MCP, automation, or guides that others reuse across teams.",
  },
  {
    id: "change_practice",
    label: "Change practice",
    description:
      "Habit formation around tools: permanent practice, not one-off training or event production.",
  },
] as const;

export type ResumeFitDimensionId = (typeof RESUME_FIT_DIMENSIONS)[number]["id"];
export type ArtifactId = (typeof AI_ADOPTION_ENGINEER_ROLE.artifacts)[number]["id"];

export function buildRoleRubricPrompt(): string {
  const role = AI_ADOPTION_ENGINEER_ROLE;
  return [
    `Role: ${role.title}`,
    `Team: ${role.team} · ${role.employment} · ${role.locations}`,
    "",
    "One-liner:",
    role.oneLiner,
    "",
    "About the role:",
    role.about,
    "",
    "Role loop:",
    ...role.roleLoop.map((phase) => `- ${phase.label} — ${phase.title}: ${phase.detail}`),
    "",
    "What you build:",
    ...role.artifacts.map((artifact) => `- ${artifact.label}: ${artifact.detail}`),
    "",
    "Who thrives:",
    ...role.whoThrives.map((line) => `- ${line}`),
    "",
    "Evaluation dimensions (score each 0-10):",
    ...RESUME_FIT_DIMENSIONS.map(
      (dimension) => `- ${dimension.id} (${dimension.label}): ${dimension.description}`,
    ),
    "",
    "Important: This role is NOT primarily about running hackathons or producing training decks.",
    "Reward builders who ship reusable technical adoption artifacts and prove habit change with data.",
    "Event facilitation alone without artifacts or measurement should not score as strong overall fit.",
  ].join("\n");
}
