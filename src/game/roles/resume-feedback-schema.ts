import { z } from "zod";
import { RESUME_FIT_DIMENSIONS } from "@/game/roles/ai-adoption-engineer";

const dimensionIdSchema = z.enum(
  RESUME_FIT_DIMENSIONS.map((dimension) => dimension.id) as [
    (typeof RESUME_FIT_DIMENSIONS)[number]["id"],
    ...(typeof RESUME_FIT_DIMENSIONS)[number]["id"][],
  ],
);

export const resumeFeedbackSchema = z.object({
  overallFit: z.enum(["strong", "promising", "stretch", "unlikely"]),
  overallScore: z
    .number()
    .min(0)
    .max(10)
    .describe("Overall role fit from 0 to 10 (not 0-100)"),
  headline: z.string().describe("One-line fit summary for the candidate"),
  summary: z
    .string()
    .describe("2-4 sentences of honest, specific feedback grounded in the resume"),
  dimensions: z
    .array(
      z.object({
        id: dimensionIdSchema,
        label: z.string(),
        score: z
          .number()
          .min(0)
          .max(10)
          .describe("Dimension score from 0 to 10 (not 0-100)"),
        evidence: z
          .string()
          .describe("What on the resume supports this score, or 'not evidenced'"),
        gap: z.string().describe("What is missing or weak for this dimension"),
        advice: z.string().describe("Concrete next step to strengthen this signal"),
      }),
    )
    .length(RESUME_FIT_DIMENSIONS.length),
  strengths: z.array(z.string()).min(2).max(5),
  gaps: z.array(z.string()).min(2).max(5),
  nextSteps: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe(
      "Actionable next steps including Cursteroids challenge and apply path when relevant",
    ),
});

export type ResumeFeedbackResult = z.infer<typeof resumeFeedbackSchema>;
