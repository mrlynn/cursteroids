# Evaluating Cursteroids submissions

This note is for recruiters and hiring managers reviewing AI Adoption Engineer candidates who used Cursteroids.

## What Cursteroids is for

| Loop | Purpose | Signal strength |
|---|---|---|
| Play (arcade mission) | Job preview and self-selection | Weak as a hiring filter |
| Shared run cards (`/run/<code>` builder identities) | Distribution and top-of-funnel | Zero — purely social |
| Account desk + phase retros | Judgment about artifacts and habit change | Medium coaching signal |
| Prove (artifact PR or Loom) | How the candidate ships adoption systems | Primary signal |

Do **not** rank candidates by Impact score or powerup count. Evaluate whether they think like a builder who ships Rules, prompts, MCP, dashboards, Cloud Agents, and workflow guides alongside eng teams.

## How to review a submission (under 5 minutes)

1. Open the PR (or Loom + written note).
2. Identify the artifact type and struggling moment.
3. Ask: would a real team own this after the candidate leaves?
4. Score against the artifact rubric:

| Criterion | Pass bar |
|---|---|
| Struggling moment | Specific org/workflow gap |
| Artifact specificity | Grounded in a stack or convention |
| Build-with ownership | Team can extend it without the candidate |
| Measurability | Hint of habit or delivery change |
| Shippability | Focused PR or crisp Loom + brief |

5. Strong pass → advance. Borderline → interview prompt: "Walk me through how you'd ship this with a skeptical platform team." Weak → decline or soft pass depending on the rest of the packet.

## Red flags

- High score brag with no artifact
- Event agendas or training decks as the only deliverable
- Generic tips with no codebase/org specificity
- Giant unrelated refactors

## Apply path

Candidates apply via [AI Adoption Engineer](https://cursor.com/careers/ai-adoption-engineer) and include their Cursteroids PR or Loom link.

Role URL is `CAREERS_URL` in [`src/game/constants.ts`](src/game/constants.ts).
