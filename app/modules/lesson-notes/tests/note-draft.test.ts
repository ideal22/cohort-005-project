import { describe, it, expect } from "vitest";
import { noteDraft } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("noteDraft", () => {
  it("offers no save for an empty box with no saved Note", () => {
    expect(noteDraft("", null)).toEqual({
      length: 0,
      maxLength: MAX_NOTE_LENGTH,
      tooLong: false,
      empty: true,
      unsaved: false,
      canSave: false,
    });
  });

  it("offers a save for new text", () => {
    const draft = noteDraft("Result types beat throwing", null);
    expect(draft.unsaved).toBe(true);
    expect(draft.canSave).toBe(true);
    expect(draft.length).toBe(26);
  });

  it("treats text that matches the saved Note as saved", () => {
    const draft = noteDraft("Same text", "Same text");
    expect(draft.unsaved).toBe(false);
    expect(draft.canSave).toBe(false);
  });

  it("treats an edit to the saved Note as unsaved", () => {
    const draft = noteDraft("Same text, edited", "Same text");
    expect(draft.unsaved).toBe(true);
    expect(draft.canSave).toBe(true);
  });

  it("does not offer to save whitespace", () => {
    const draft = noteDraft("   \n ", null);
    expect(draft.empty).toBe(true);
    expect(draft.unsaved).toBe(true);
    expect(draft.canSave).toBe(false);
  });

  it("does not offer to clear a saved Note to blank", () => {
    expect(noteDraft("", "Old note").canSave).toBe(false);
  });

  it("allows a Note of exactly the maximum length", () => {
    const draft = noteDraft("a".repeat(MAX_NOTE_LENGTH), null);
    expect(draft.tooLong).toBe(false);
    expect(draft.canSave).toBe(true);
  });

  it("refuses a Note one character over the maximum", () => {
    const draft = noteDraft("a".repeat(MAX_NOTE_LENGTH + 1), null);
    expect(draft.tooLong).toBe(true);
    expect(draft.canSave).toBe(false);
  });
});
