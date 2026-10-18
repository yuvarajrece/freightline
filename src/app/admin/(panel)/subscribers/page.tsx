import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SubscribersTable } from "@/components/admin/SubscribersTable";
import { requireAdmin } from "@/services/admin-context";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const { container } = await requireAdmin();
  const subscribers = await container.inboxService.listSubscribers();

  return (
    <>
      <PageHeader title="Subscribers" description={`${subscribers.length} people have joined the newsletter.`} />
      <SubscribersTable subscribers={subscribers} />
    </>
  );
}
