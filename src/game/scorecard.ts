import { CAMPAIGN_PHASES } from "@/game/constants";
import { formatDebriefsForShare } from "@/game/dialogue";
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
  const lifePoints = snapshot.lives * 28;
  const nearMissPoints = Math.min(36, snapshot.nearMisses * 6);
  const accuracyPoints = snapshot.accuracy * 0.28;
  const deathPenalty = snapshot.status === "gameOver" ? 18 : 0;
  return clampScore(lifePoints + nearMissPoints + accuracyPoints - deathPenalty);
}

function systemsScore(snapshot: GameSnapshot) {
  const phasePoints = Math.min(CAMPAIGN_PHASES, snapshot.level) * 18;
  const completeBonus = snapshot.status === "missionComplete" ? 28 : 0;
  const progressBonus = snapshot.level > 1 ? 10 : 0;
  const debriefBonus = Math.min(24, snapshot.debriefs.length * 6);
  return clampScore(phasePoints + completeBonus + progressBonus + debriefBonus);
}

function toolsScore(snapshot: GameSnapshot) {
  const collected = snapshot.powerupsCollected * 18;
  const usedWell = snapshot.powerupsUsedWell * 16;
  const activeBonus = snapshot.activePowerup ? 8 : 0;
  return clampScore(collected + usedWell + activeBonus);
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
        return "You protected Trust under pressure. That is the job.";
      }
      if (score >= 40) {
        return "Some Trust held. Enablement fails when demos burn credibility.";
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
        return "You used Cursor-shaped powerups when the moment called for them.";
      }
      if (score >= 40) {
        return "Some tool use showed up. Timing matters as much as picking them up.";
      }
      return "Grab Rules, Tab, or Agent Mode drops and spend them on hard waves.";
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
  const shareText = [
    `Cursteroids — AI Adoption Engineer simulator`,
    `${headline}`,
    `Impact ${snapshot.score} · Phase ${Math.min(snapshot.level, CAMPAIGN_PHASES)}/${CAMPAIGN_PHASES} · ${dimLine}`,
    debriefLines ? `Retros:\n${debriefLines}` : "",
    `Builder challenge: fork and improve one blocker.`,
    origin || (typeof window !== "undefined" ? window.location.href : ""),
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
  };
}
