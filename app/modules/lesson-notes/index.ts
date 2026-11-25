import { describeDraft, type NoteDraft } from "./lib/draft";

export type { NoteDraft };

/**
 * What the Note editor shows for the text in the box, given the body last
 * saved (null when the Student has not written a Note on this Lesson yet).
 */
export function noteDraft(draft: string, savedBody: string | null): NoteDraft {
  return describeDraft(draft, savedBody);
}
