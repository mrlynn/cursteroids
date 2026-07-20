import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CAREERS_URL } from "@/game/constants";
import { decodeRunCode, type RunResultPayload } from "@/game/encode";
import { profileById } from "@/game/profiles";
import { AI_ADOPTION_ENGINEER_ROLE } from "@/game/roles/ai-adoption-engineer";

type RunPageProps = {
  params: Promise<{ code: string }>;
};

const DIMENSION_LABELS: Record<keyof RunResultPayload["dimensions"], string> = {
  diagnosis: "Diagnosis",
  trust: "Trust",
  systems: "Systems",
  tools: "Tool use",
};

const DIMENSION_ORDER: (keyof RunResultPayload["dimensions"])[] = [
  "diagnosis",
  "trust",
  "systems",
  "tools",
];

const DEFAULT_ARTIFACT_LINE = "a team-specific Rules library + ownership handoff";

export async function generateMetadata({ params }: RunPageProps): Promise<Metadata> {
  const { code } = await params;
  const payload = decodeRunCode(code);

  if (!payload) {
    return {
      title: "Cursteroids | AI Adoption Engineer Simulator",
      description:
        "Credibility from what you ship alongside the team. Play the AI Adoption Engineer loop.",
    };
  }

  const profile = profileById(payload.profileId);
  const title = `I'm a ${profile.name} — Cursteroids`;
  const description = `${profile.tagline} ${AI_ADOPTION_ENGINEER_ROLE.oneLiner}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RunResultPage({ params }: RunPageProps) {
  const { code } = await params;
  const payload = decodeRunCode(code);

  if (!payload) {
    notFound();
  }

  const profile = profileById(payload.profileId);
  const artifact = AI_ADOPTION_ENGINEER_ROLE.artifacts[payload.topArtifactIndex];
  const artifactLine = artifact ? artifact.label : DEFAULT_ARTIFACT_LINE;

  return (
    <>
      <style>{`
        .run-page {
          --bg: #ffffff;
          --fg: #11110f;
          --muted: #55554f;
          --border: rgba(17, 17, 15, 0.14);
          --accent: #0f766e;
          --accent-bright: #2dd4bf;
          --track: rgba(17, 17, 15, 0.08);
        }
        @media (prefers-color-scheme: dark) {
          .run-page {
            --bg: #0b0b0a;
            --fg: #f5f5f4;
            --muted: #a3a39c;
            --border: rgba(245, 245, 244, 0.14);
            --track: rgba(245, 245, 244, 0.1);
          }
        }
        .run-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--fg);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          justify-content: center;
          padding: 48px 20px 64px;
        }
        .run-card {
          width: 100%;
          max-width: 720px;
        }
        .run-kicker {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent);
          margin: 0 0 12px;
        }
        .run-headline {
          font-size: clamp(2rem, 6vw, 3.25rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 14px;
        }
        .run-tagline {
          font-size: 1.05rem;
          color: var(--muted);
          line-height: 1.5;
          margin: 0 0 32px;
          max-width: 560px;
        }
        .run-section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 14px;
        }
        .run-bars {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin: 0 0 28px;
        }
        .run-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .run-bar-label {
          width: 96px;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
        }
        .run-bar-track {
          flex: 1;
          height: 8px;
          border-radius: 999px;
          background: var(--track);
          overflow: hidden;
        }
        .run-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--accent), var(--accent-bright));
        }
        .run-bar-score {
          width: 32px;
          text-align: right;
          font-size: 13px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .run-meta-line {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 8px;
        }
        .run-meta-line strong {
          color: var(--fg);
        }
        .run-artifact-line {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 36px;
          padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
        }
        .run-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .run-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 18px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid var(--border);
          color: var(--fg);
        }
        .run-cta.primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #ffffff;
        }
      `}</style>
      <div className="run-page">
        <div className="run-card">
          <p className="run-kicker">Cursteroids · Run result</p>
          <h1 className="run-headline">{profile.name}</h1>
          <p className="run-tagline">{profile.tagline}</p>

          <p className="run-section-label">Dimensions</p>
          <div className="run-bars">
            {DIMENSION_ORDER.map((id) => {
              const score = payload.dimensions[id];
              return (
                <div className="run-bar-row" key={id}>
                  <span className="run-bar-label">{DIMENSION_LABELS[id]}</span>
                  <span className="run-bar-track">
                    <span className="run-bar-fill" style={{ width: `${score}%` }} />
                  </span>
                  <span className="run-bar-score">{score}</span>
                </div>
              );
            })}
          </div>

          <p className="run-meta-line">
            <strong>Phase {payload.phase}/4</strong>
            {" · "}
            <strong>Impact {payload.impact}</strong>
            {payload.completed ? " · Mission complete" : ""}
          </p>

          <p className="run-artifact-line">Artifact I&apos;d ship: {artifactLine}</p>

          <div className="run-ctas">
            <Link className="run-cta primary" href="/">
              Play Cursteroids
            </Link>
            <a className="run-cta" href={CAREERS_URL} target="_blank" rel="noopener noreferrer">
              Apply — AI Adoption Engineer
            </a>
            <Link className="run-cta" href="/#artifact-challenge">
              Try the artifact challenge
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
