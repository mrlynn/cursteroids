# Cursteroids

**The job description you can play.**

Cursteroids is a playable recruiting microsite for the **AI Adoption Engineer** role at Cursor. Instead of reading about the job, you play it: every mechanic is a Cursor product concept or a role judgment call.

Credibility comes from what you ship alongside the team, not from what you present to them.

## Why it exists

AI Adoption Engineers turn AI pilots into permanent practice inside enterprise eng orgs. They ship Rules libraries, prompt architectures, MCP configs, dashboards, Cloud Agent workflows, and enablement guides — then leave systems the next team can start from.

Cursteroids gives candidates a commitment ladder:

1. **Play** — a 90-second mission where the mechanics teach the role (see below)
2. **Judge** — Account Desk artifact decisions and phase retros with real consequences
3. **Check fit** — resume feedback against the actual rubric
4. **Prove it** — ship one adoption artifact sample (PR or Loom). This is the real filter.

## The mechanics are the teaching

| Mechanic | What you do | What it teaches |
|---|---|---|
| **Tab-fire** | A dotted suggestion line tracks the best target; press Tab to accept and snap-fire | Accepting a good completion beats aiming manually |
| **Trust meter** | Collisions and overclaiming (long miss streaks) drain Trust; conversions and phase clears restore it | Adoption work starts with not breaking the team |
| **Convert blockers** | "low trust in AI" and "IDE skepticism" can't be shot dead — fly alongside them to pair and convert them into allies | Build *with* them, not in front of them |
| **Agent deploys** | Cloud Agent pickups bank charges; press E to launch a drone at chore blockers while you handle the judgment-heavy ones | Agents take the toil, you take the thinking |
| **Persistent Rules** | A Rules pickup permanently pre-weakens future spawns of a blocker type | Rules libraries outlive the session |
| **Consequential retros** | Your intervention choice after each phase concretely modifies the next wave | Interventions have consequences, not just answers |

Controls: Arrows/WASD to fly, Space to fire, **Tab** to accept the suggestion, **E** to deploy an agent, P to pause. Touch controls on mobile.

## Share your run

Every finished run produces a permalink (`/run/<code>`) with your **builder identity** — Trust Guardian, Workflow Diagnoser, Systems Operator, Enablement Operator, or Adoption Systems Builder — that unfurls as a rich Open Graph card in feeds. Run results are encoded entirely in the URL; nothing is stored.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Resume fit check requires `OPENAI_API_KEY`.

## Resume fit check

Upload PDF/TXT or paste text at `#resume-feedback`. Dimensions: technical architecture, systems thinking, build-with enablement, measurement, artifact craft, change practice. Advisory only; resumes are not stored.

## Artifact challenge

Ship one adoption artifact sample. Start by reading the `.cursorrules` at the repo root — it's written as a model of the leave-behind artifacts this role ships. The rubric and PR template ask for artifact type, target stack, ownership path, and measurability.

Apply: [AI Adoption Engineer](https://cursor.com/careers/ai-adoption-engineer)

## Where to change code

| Goal | Start here |
|---|---|
| Role copy / resume rubric | [`src/game/roles/ai-adoption-engineer.ts`](src/game/roles/ai-adoption-engineer.ts) |
| Game mechanics | [`src/game/engine.ts`](src/game/engine.ts), [`src/game/blockers.ts`](src/game/blockers.ts) |
| Powerups | [`src/game/powerups.ts`](src/game/powerups.ts) |
| Retro → wave modifiers | [`src/game/modifiers.ts`](src/game/modifiers.ts) |
| Account desk / retros | [`src/game/dialogue.ts`](src/game/dialogue.ts) |
| Builder identities / share | [`src/game/profiles.ts`](src/game/profiles.ts), [`src/game/share.ts`](src/game/share.ts), [`src/game/encode.ts`](src/game/encode.ts) |
| Result permalink page / OG card | [`src/app/run/[code]/`](src/app/run) |
| Challenge brief | [`src/game/challenge.ts`](src/game/challenge.ts) |

There are a few things in here for the curious. Poking around is encouraged — it's the job.

## For recruiters

See [`EVAL.md`](EVAL.md). Arcade score is not the filter. Artifact PRs are.

## Stack

- Next.js App Router
- TypeScript
- Material UI
- Canvas game loop
- Vercel AI SDK (resume feedback)
