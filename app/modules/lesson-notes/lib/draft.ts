import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteDraft = {
  length: number;
  maxLength: number;
  tooLong: boolean;
  empty: boolean;
  unsaved: boolean;
  canSave: boolean;
};

export function describeDraft(
  draft: string,
  savedBody: string | null
): NoteDraft {
  const tooLong = draft.length > MAX_NOTE_LENGTH;
  // The save action trims the body and rejects a blank one, so compare and
  // judge the box as the action will store it.
  const trimmed = draft.trim();
  const empty = trimmed.length === 0;
  const unsaved = trimmed !== (savedBody ?? "");

  return {
    length: draft.length,
    maxLength: MAX_NOTE_LENGTH,
    tooLong,
    empty,
    unsaved,
    canSave: unsaved && !empty && !tooLong,
  };
}
