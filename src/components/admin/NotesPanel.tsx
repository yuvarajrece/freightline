"use client";

import { Loader2, Pin, PinOff, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { deleteNoteAction, saveNoteAction, toggleNotePinAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form";
import type { AdminNote, NoteEntityType } from "@/core/domain/models";
import { cn, formatDateTime } from "@/lib/utils";
import { ConfirmButton } from "./ConfirmButton";
import { useAction } from "./useAction";

interface NotesPanelProps {
  entityType: NoteEntityType;
  entityId: string | null;
  notes: AdminNote[];
  /** Show a title field and larger layout (used on the Notes page). */
  titled?: boolean;
  emptyText?: string;
}

export function NotesPanel({ entityType, entityId, notes, titled = false, emptyText = "No notes yet." }: NotesPanelProps) {
  const { run, pending } = useAction();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>, id: string | null, pinned: boolean) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setErrors({});

    const result = await run(() =>
      saveNoteAction(id, {
        entity_type: entityType,
        entity_id: entityId,
        title: String(data.get("title") ?? ""),
        body: String(data.get("body") ?? ""),
        pinned: id ? pinned : data.get("pinned") === "on",
      }),
    );

    if (result.ok) {
      form.reset();
      setEditingId(null);
    } else {
      setErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={(event) => onSubmit(event, null, false)} noValidate className={cn("space-y-3", titled && "rounded-2xl border border-ink-100 bg-white p-5")}>
        {titled ? <TextField label="Title" name="title" maxLength={160} error={errors.title?.[0]} /> : null}
        <TextAreaField
          label={titled ? "Note" : "Add a note"}
          name="body"
          rows={titled ? 4 : 2}
          maxLength={8000}
          error={errors.body?.[0]}
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" name="pinned" className="size-4 rounded border-ink-300 accent-signal-500" />
            Pin to dashboard
          </label>
          <Button type="submit" variant="dark" size="sm" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-label="Saving" /> : <Plus className="size-4" aria-hidden="true" />}
            Save note
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <p className="text-sm text-ink-500">{emptyText}</p>
      ) : (
        <ul className={cn("gap-3", titled ? "grid md:grid-cols-2" : "space-y-3")}>
          {notes.map((note) => (
            <li
              key={note.id}
              className={cn(
                "rounded-xl border p-4",
                note.pinned ? "border-signal-300 bg-signal-50" : "border-ink-100 bg-white",
              )}
            >
              {editingId === note.id ? (
                <form onSubmit={(event) => onSubmit(event, note.id, note.pinned)} noValidate className="space-y-3">
                  {titled ? <TextField label="Title" name="title" defaultValue={note.title} maxLength={160} /> : <input type="hidden" name="title" value={note.title} />}
                  <TextAreaField label="Note" name="body" rows={4} defaultValue={note.body} maxLength={8000} error={errors.body?.[0]} />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="dark" size="sm" disabled={pending}>
                      Save
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {note.title ? <p className="font-display text-base font-semibold">{note.title}</p> : null}
                  <p className="text-sm whitespace-pre-wrap text-ink-800">{note.body}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-ink-500">
                      {note.author_email ? `${note.author_email} · ` : ""}
                      {formatDateTime(note.updated_at)}
                    </p>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => void run(() => toggleNotePinAction(note.id, !note.pinned), { silent: true })}
                        aria-label={note.pinned ? "Unpin note" : "Pin note"}
                        className="grid size-8 place-items-center rounded-lg text-ink-600 hover:bg-ink-100"
                      >
                        {note.pinned ? <PinOff className="size-4" aria-hidden="true" /> : <Pin className="size-4" aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(note.id)}
                        className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                      >
                        Edit
                      </button>
                      <ConfirmButton
                        ariaLabel="Delete note"
                        confirmText="Delete this note?"
                        action={() => deleteNoteAction(note.id)}
                      />
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
