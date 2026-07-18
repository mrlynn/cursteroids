import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import {
  AI_ADOPTION_ENGINEER_ROLE,
  buildRoleRubricPrompt,
} from "@/game/roles/ai-adoption-engineer";
import {
  resumeFeedbackSchema,
  type ResumeFeedbackResult,
} from "@/game/roles/resume-feedback-schema";
import { extractResumeText } from "@/lib/extract-resume-text";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/** Models sometimes return 0-100; normalize to a clear 0-10 scale. */
function toTen(score: number) {
  const onTen = score > 10 ? score / 10 : score;
  return Math.min(10, Math.max(0, Math.round(onTen * 10) / 10));
}

function normalizeScores(feedback: ResumeFeedbackResult): ResumeFeedbackResult {
  return {
    ...feedback,
    overallScore: toTen(feedback.overallScore),
    dimensions: feedback.dimensions.map((dimension) => ({
      ...dimension,
      score: toTen(dimension.score),
    })),
  };
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "Resume feedback is not configured (missing OPENAI_API_KEY)." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = formData.get("resume");
  const pasted = formData.get("resumeText");

  let resumeText = "";

  try {
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return Response.json(
          { error: "Resume must be under 2MB." },
          { status: 400 },
        );
      }
      resumeText = await extractResumeText(file);
    } else if (typeof pasted === "string" && pasted.trim()) {
      resumeText = pasted.trim().slice(0, 24_000);
    } else {
      return Response.json(
        { error: "Upload a resume file or paste resume text." },
        { status: 400 },
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read resume.";
    return Response.json({ error: message }, { status: 400 });
  }

  const rolePrompt = buildRoleRubricPrompt();

  try {
    const { output } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        schema: resumeFeedbackSchema,
        name: "ResumeRoleFeedback",
        description: "Structured fit feedback against the AI Adoption Engineer role",
      }),
      temperature: 0.3,
      system: [
        "You are a hiring coach helping candidates understand fit for Cursor's AI Adoption Engineer role.",
        "Be direct, specific, and evidence-based. Quote or paraphrase resume signals; do not invent experience.",
        "If something is missing, say so clearly. Do not flatter. Do not reject harshly — coach.",
        "Events without adoption outcomes should score lower on behavior_change.",
        "Pure content/training backgrounds without live facilitation should score lower on facilitation.",
        "Always return all six dimensions.",
        "All scores MUST be on a 0-10 scale (integers or one decimal). Never use 0-100.",
        "overallScore should be a weighted judgment of role fit, roughly consistent with the dimension scores.",
        "When fit is strong or promising, include applying and the Cursteroids builder challenge in nextSteps.",
        "When fit is stretch or unlikely, suggest concrete experience to gain before applying.",
        "Never claim this is an official Cursor hiring decision. This is advisory feedback only.",
      ].join(" "),
      prompt: [
        rolePrompt,
        "",
        "--- Candidate resume (extracted text) ---",
        resumeText,
        "",
        "Score each dimension 0-10. Score overall fit 0-10. Reflect role fit, not generic seniority.",
      ].join("\n"),
    });

    if (!output) {
      return Response.json({ error: "Model returned empty feedback." }, { status: 502 });
    }

    return Response.json({
      role: {
        id: AI_ADOPTION_ENGINEER_ROLE.id,
        title: AI_ADOPTION_ENGINEER_ROLE.title,
        careersUrl: AI_ADOPTION_ENGINEER_ROLE.careersUrl,
      },
      feedback: normalizeScores(output),
      scoreScale: { min: 0, max: 10, label: "out of 10" },
      disclaimer:
        "Advisory feedback only. Not an official Cursor hiring decision. Your resume is not stored.",
    });
  } catch (error) {
    console.error("resume-feedback failed", error);
    return Response.json(
      { error: "Could not generate feedback. Try again in a moment." },
      { status: 502 },
    );
  }
}
