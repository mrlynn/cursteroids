import { CAMPAIGN_PHASES } from "@/game/constants";
import { formatDebriefsForShare } from "@/game/dialogue";
import { profileForDimensions, type BuilderProfile } from "@/game/profiles";
import {
  buildRunCodeFromSnapshot,
  buildRunShareText,
  buildRunUrl,
  fitShareFromGameSnapshot,
} from "@/game/share";
import type { GameSnapshot } from "@/game/types";

export type ScoreDimension = {
  id: "diagnosis" | "trust" | "systems" | "tools";
  label: string;
  score: number;
  blurb: string;
};

export type RecruitingScorecard = {
  headline: string;
  summary: string;
  dimensions: ScoreDimension[];
  shareText: string;
  completedMission: boolean;
  debriefs: GameSnapshot["debriefs"];
  fitCard: ReturnType<typeof fitShareFromGameSnapshot>;
  /** Builder identity for this run (drives the /run permalink + OG card). */
  profile: BuilderProfile;
  /** Shareable permalink to this run's result page. */
  runUrl: string;
  /** Short, feed-friendly share blurb (identity + tagline + link). */
  runShareText: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function diagnosisScore(snapshot: GameSnapshot) {
  const labels = Object.keys(snapshot.blockersCleared);
  const distinctive = ["low trust in AI", "no evals", "unclear ROI"].filter(
    (label) => (snapshot.blockersCleared[label] ?? 0) > 0,
  );
  const variety = labels.length * 12;
  const depth = distinctive.length * 22;
  const volume = Object.values(snapshot.blockersCleared).reduce((sum, n) => sum + n, 0) * 4;
  return clampScore(variety + depth + volume);
}

function trustScore(snapshot: GameSnapshot) {
  const trustPoints = snapshot.trust * 0.7;
  const nearMissPoints = Math.min(36, snapshot.nearMisses * 6);
  const accuracyPoints = snapshot.accuracy * 0.2;
  const tabPoints = Math.min(12, snapshot.tabAccepts * 1.5);
  const deathPenalty = snapshot.status === "gameOver" ? 18 : 0;
  return clampScore(trustPoints + nearMissPoints + accuracyPoints + tabPoints - deathPenalty);
}

function systemsScore(snapshot: GameSnapshot) {
  const phasePoints = Math.min(CAMPAIGN_PHASES, snapshot.level) * 18;
  const completeBonus = snapshot.status === "missionComplete" ? 28 : 0;
  const progressBonus = snapshot.level > 1 ? 10 : 0;
  const debriefBonus = Math.min(24, snapshot.debriefs.length * 6);
  return clampScore(phasePoints + completeBonus + progressBonus + debriefBonus);
}

function toolsScore(snapshot: GameSnapshot) {
  const collected = snapshot.powerupsCollected * 10;
  const usedWell = snapshot.powerupsUsedWell * 12;
  const agentPoints = snapshot.agentDeploys * 14;
  const conversionPoints = snapshot.conversions * 16;
  const rulesCoveragePoints = snapshot.rulesCoverageCount * 10;
  const activeBonus = snapshot.activePowerup ? 6 : 0;
  return clampScore(collected + usedWell + agentPoints + conversionPoints + rulesCoveragePoints + activeBonus);
}

function dimensionBlurb(id: ScoreDimension["id"], score: number): string {
  switch (id) {
    case "diagnosis":
      if (score >= 70) {
        return "You hunted the distinctive blockers, not just the easy rocks.";
      }
      if (score >= 40) {
        return "You cleared friction, but the hard adoption cases still need focus.";
      }
      return "Next run: prioritize low trust, no evals, and unclear ROI.";
    case "trust":
      if (score >= 70) {
        return "You protected the Trust meter under pressure and let Tab-fire do the precise work.";
      }
      if (score >= 40) {
        return "Some Trust held. Enablement fails when demos burn credibility — and overclaiming burns Trust too.";
      }
      return "Trust collapsed early. Adoption work starts with not breaking the team.";
    case "systems":
      if (score >= 70) {
        return "You moved through the role loop like a system, not a one-off demo.";
      }
      if (score >= 40) {
        return "You got partway through Diagnose → Design → Enable → Scale.";
      }
      return "Finish the four-phase mission to show you can run the loop end to end.";
    case "tools":
      if (score >= 70) {
        return "You shipped Rules coverage, deployed the Cloud Agent on chores, and converted skeptics instead of just clearing them.";
      }
      if (score >= 40) {
        return "Some artifact powerups showed up. Deploying the Agent and pairing with convert-type blockers count more than just picking up drops.";
      }
      return "Pick up Rules, MCP, Cloud Agent, or Dashboard drops — then deploy the Agent (E) and pair with skeptics instead of shooting through them.";
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

function headlineFor(dimensions: ScoreDimension[], completedMission: boolean) {
  const top = [...dimensions].sort((a, b) => b.score - a.score)[0];
  if (completedMission) {
    return "Mission complete · Adoption Systems Builder";
  }
  switch (top?.id) {
    case "diagnosis":
      return "Profile · Workflow Diagnoser";
    case "trust":
      return "Profile · Trust Guardian";
    case "systems":
      return "Profile · Systems Operator";
    case "tools":
      return "Profile · Enablement Operator";
    default:
      return "Profile · AI Change Agent";
  }
}

function summaryFor(dimensions: ScoreDimension[], completedMission: boolean) {
  if (completedMission) {
    return "You cleared the four-phase adoption loop. The hiring signal is not this score — it is what you build next.";
  }
  const weak = [...dimensions].sort((a, b) => a.score - b.score)[0];
  const strong = [...dimensions].sort((a, b) => b.score - a.score)[0];
  return `${strong.blurb} Watch-out: ${weak.blurb}`;
}

export function buildScorecard(snapshot: GameSnapshot, origin = ""): RecruitingScorecard {
  const completedMission = snapshot.status === "missionComplete";
  const raw: Omit<ScoreDimension, "blurb">[] = [
    { id: "diagnosis", label: "Diagnosis", score: diagnosisScore(snapshot) },
    { id: "trust", label: "Trust", score: trustScore(snapshot) },
    { id: "systems", label: "Systems", score: systemsScore(snapshot) },
    { id: "tools", label: "Tool use", score: toolsScore(snapshot) },
  ];
  const dimensions: ScoreDimension[] = raw.map((item) => ({
    ...item,
    blurb: dimensionBlurb(item.id, item.score),
  }));
  const headline = headlineFor(dimensions, completedMission);
  const summary = summaryFor(dimensions, completedMission);
  const dimLine = dimensions.map((d) => `${d.label} ${d.score}`).join(" · ");
  const debriefLines = formatDebriefsForShare(snapshot.debriefs);

  const profile = profileForDimensions(
    dimensions.map((d) => ({ id: d.id, score: d.score })),
    completedMission,
  );
  const runCode = buildRunCodeFromSnapshot(snapshot, profile.id, {
    diagnosis: dimensions[0].score,
    trust: dimensions[1].score,
    systems: dimensions[2].score,
    tools: dimensions[3].score,
  });
  const runUrl = buildRunUrl(runCode, origin);
  const runShareText = buildRunShareText(profile.name, runUrl);

  const fitCard = fitShareFromGameSnapshot(snapshot, headline, origin, runUrl);
  const shareText = [
    runShareText,
    "",
    `Impact ${Math.round(snapshot.score)} · Phase ${Math.min(snapshot.level, CAMPAIGN_PHASES)}/${CAMPAIGN_PHASES} · ${dimLine}`,
    debriefLines ? `Retros:\n${debriefLines}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    headline,
    summary,
    dimensions,
    shareText,
    completedMission,
    debriefs: snapshot.debriefs,
    fitCard,
    profile,
    runUrl,
    runShareText,
  };
}
