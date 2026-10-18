import type { Metadata } from "next";
import { InboxList, type InboxItem } from "@/components/admin/InboxList";
import { PageHeader } from "@/components/admin/PageHeader";
import { MESSAGE_STATUSES } from "@/core/domain/models";
import { groupBy } from "@/lib/group";
import { requireAdmin } from "@/services/admin-context";
import { deleteMessageAction, setMessageStatusAction } from "../../actions";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const { container } = await requireAdmin();
  const [messages, notes] = await Promise.all([container.inboxService.listMessages(), container.noteService.listByType("message")]);
  const notesByMessage = groupBy(notes, (note) => note.entity_id);

  const items: InboxItem[] = messages.map((message) => ({
    id: message.id,
    title: message.full_name,
    subtitle: message.subject || message.message,
    email: message.email,
    phone: message.phone,
    createdAt: message.created_at,
    status: message.status,
    details: message.subject ? [{ label: "Subject", value: message.subject }] : [],
    body: message.message,
    notes: notesByMessage.get(message.id) ?? [],
  }));

  return (
    <>
      <PageHeader title="Messages" description="Everything sent through the contact form." />
      <InboxList
        entityType="message"
        noun="messages"
        items={items}
        statuses={MESSAGE_STATUSES}
        onStatusChange={setMessageStatusAction}
        onDelete={deleteMessageAction}
        exportHref="/admin/export/messages"
      />
    </>
  );
}
