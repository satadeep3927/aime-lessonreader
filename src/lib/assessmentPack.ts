import type { AssessmentPackRead } from "@/types/api";

/**
 * Extract the assessment pack from lesson pack meta.
 * Returns null if no assessment pack is baked in.
 */
export function getAssessmentPack(
  meta: Record<string, unknown> | undefined | null,
): AssessmentPackRead | null {
  if (!meta || !meta.assessmentPack) return null;
  return meta.assessmentPack as AssessmentPackRead;
}

/**
 * Return a partial meta patch that sets the assessment pack.
 * Used with patchAndRezip / saveLessonPack.
 */
export function setAssessmentPack(
  pack: AssessmentPackRead,
): Record<string, unknown> {
  return { assessmentPack: pack };
}
