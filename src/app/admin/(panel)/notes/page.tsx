import type { Metadata } from "next";
import { NotesPanel } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { requireAdmin } from "@/services/admin-context";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const { container } = await requireAdmin();
  const notes = await container.noteService.listGeneral();

  return (
    <>
      <PageHeader
        title="Notes"
        description="A shared notebook for the team: follow-ups, rate changes, ideas. Notes on individual quotes, messages and shipments live on those records."
      />
      <NotesPanel entityType="general" entityId={null} notes={notes} titled emptyText="No notes yet. Write the first one above." />
    </>
  );
}
