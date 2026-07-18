# Cursteroids

Cursteroids is a playable recruiting microsite for the **AI Adoption Engineer** role at Cursor.

You pilot the Cursor logo through a four-phase Asteroids-style mission. Every asteroid is an adoption blocker. Some blockers have real mechanics. Powerups map to Cursor workflows. Clearing the campaign is the job preview.

The hiring signal is not your high score. It is the **builder challenge**.

## Why it exists

The best AI Adoption Engineers are builders who can make abstract workflow change feel concrete. Cursteroids is a lightweight way to:

1. **Play** — feel the role loop (Diagnose → Design → Enable → Measure/Scale)
2. **Prove** — fork the game and improve one blocker as a mechanic or teaching moment

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — local dev server
- `npm run lint` — ESLint
- `npm run build` — production build

## Play → Prove

### Loop A: Play (job preview)

- Four campaign phases; clear Phase 4 to complete the mission
- Distinctive blockers in [`src/game/blockers.ts`](src/game/blockers.ts):
  - `low trust in AI` — armored (two hits)
  - `no evals` — regenerates if you do not finish the eval window
  - `unclear ROI` — drains Impact while it lives
- Powerups in [`src/game/powerups.ts`](src/game/powerups.ts):
  - **Rules** — temporary shield
  - **Tab** — faster fire
  - **Agent Mode** — steers assist toward the nearest hard blocker
- Scorecard in [`src/game/scorecard.ts`](src/game/scorecard.ts) scores diagnosis, trust, systems, and tool use. Arcade skill is not the filter.

### Loop B: Builder challenge (the filter)

Fork Cursteroids and make **one** adoption blocker more interesting — as a mechanic or a teaching moment. Open a PR, or record a short Loom plus a written note on why this helps a team adopt Cursor.

Then apply at [cursor.com/careers](https://cursor.com/careers) and include your PR or Loom link.

### Rubric

| Criterion | What strong looks like |
|---|---|
| Struggling moment | Names a real adoption friction, not a vague AI buzzword |
| Mechanic quality | The blocker behaves differently in play, or teaches a clear Cursor workflow |
| Teaching value | A teammate could explain the lesson after one run |
| Taste and restraint | Small, shippable change. No feature pile-on |
| Shippability | PR is focused, typed, and runnable with `npm run dev` |

Use the PR template in [`.github/pull_request_template.md`](.github/pull_request_template.md).

### Where to change code

| Goal | Start here |
|---|---|
| New or deeper blocker mechanic | [`src/game/blockers.ts`](src/game/blockers.ts) + collision logic in [`src/game/engine.ts`](src/game/engine.ts) |
| New powerup | [`src/game/powerups.ts`](src/game/powerups.ts) |
| Scorecard copy / dimensions | [`src/game/scorecard.ts`](src/game/scorecard.ts) |
| Challenge brief on the page | [`src/game/challenge.ts`](src/game/challenge.ts) + [`src/app/page.tsx`](src/app/page.tsx) |

## For recruiters

Arcade score is not the hiring signal. Read the PR or Loom against the rubric. Strong submissions make one blocker concrete and show how the candidate thinks about enablement.

See [`EVAL.md`](EVAL.md).

## Stack

- Next.js App Router
- TypeScript
- Material UI
- Canvas game loop
