# Evaluating Cursteroids submissions

This note is for recruiters and hiring managers reviewing AI Adoption Engineer candidates who used Cursteroids.

## What Cursteroids is for

| Loop | Purpose | Signal strength |
|---|---|---|
| Play (arcade mission) | Job preview and self-selection | Weak as a hiring filter |
| Prove (PR or Loom) | How the candidate makes adoption concrete | Primary signal |

Do **not** rank candidates by Impact score, accuracy, or archetype headline from the in-game scorecard. Those dimensions exist to teach the role metaphor and invite the challenge.

## How to review a submission (under 5 minutes)

1. Open the PR (or Loom + written note).
2. Read the struggling moment. Is it a real team friction or buzzword theater?
3. Play or watch the change. Does one blocker behave differently or teach a Cursor workflow?
4. Score against the rubric in the README / site:

| Criterion | Pass bar |
|---|---|
| Struggling moment | Specific, believable adoption friction |
| Mechanic quality | Clear difference in play or teaching |
| Teaching value | Someone else could retell the lesson |
| Taste and restraint | Focused change; not a kitchen-sink rewrite |
| Shippability | Runs locally; PR template filled in |

5. Strong pass → advance. Borderline → use as interview prompt ("walk me through why you chose this blocker"). Weak → decline or soft pass depending on rest of packet.

## Apply path

Candidates should apply via [cursor.com/careers](https://cursor.com/careers) and include their Cursteroids PR or Loom link in the application.

If a dedicated AI Adoption Engineer posting URL is available, update `CAREERS_URL` in [`src/game/constants.ts`](src/game/constants.ts).

## Red flags

- High score brag with no PR or Loom
- Reskin-only changes (new labels, no mechanic or teaching)
- Giant unrelated refactors
- Copy that overclaims Cursor features the change does not demonstrate
