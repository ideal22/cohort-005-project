import { useState } from "react";
import { useFetcher } from "react-router";
import { Lock, NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { noteDraft, type NoteDraft } from "~/modules/lesson-notes";
import { cn, formatRelativeTime } from "~/lib/utils";

type SavedNote = { body: string; updatedAt: string };

export function LessonNote({ note }: { note: SavedNote | null }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [body, setBody] = useState(note?.body ?? "");
  const draft = noteDraft(body, note?.body ?? null);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <NoteHeader />
        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Key ideas, questions to come back to, code to try..."
            aria-label="Your notes"
            className="resize-y"
          />
          <NoteFooter
            draft={draft}
            isSaving={fetcher.state !== "idle"}
            error={fetcher.data?.error}
            updatedAt={note?.updatedAt}
          />
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteHeader() {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <NotebookPen className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Your notes</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Jot down what you want to remember from this lesson.
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Only you can see this
      </span>
    </div>
  );
}

function NoteFooter({
  draft,
  isSaving,
  error,
  updatedAt,
}: {
  draft: NoteDraft;
  isSaving: boolean;
  error: string | undefined;
  updatedAt: string | undefined;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button type="submit" size="sm" disabled={isSaving || !draft.canSave}>
        {isSaving ? "Saving..." : "Save note"}
      </Button>
      <NoteStatus error={error} unsaved={draft.unsaved} updatedAt={updatedAt} />
      <span
        className={cn(
          "ml-auto text-xs",
          draft.tooLong ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {draft.length} / {draft.maxLength}
      </span>
    </div>
  );
}

function NoteStatus({
  error,
  unsaved,
  updatedAt,
}: {
  error: string | undefined;
  unsaved: boolean;
  updatedAt: string | undefined;
}) {
  if (error) return <span className="text-sm text-destructive">{error}</span>;
  if (!updatedAt) return null;
  if (unsaved) {
    return (
      <span className="text-xs text-muted-foreground">Unsaved changes</span>
    );
  }
  return (
    <span suppressHydrationWarning className="text-xs text-muted-foreground">
      Saved · edited {formatRelativeTime(updatedAt)}
    </span>
  );
}
