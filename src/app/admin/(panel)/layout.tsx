import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/services/admin-context";
import { signOutAction } from "../actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const { user, container } = await requireAdmin();
  const { newQuotes, newMessages } = await container.dashboardService.getBadgeCounts();

  return (
    <AdminShell email={user.email} newQuotes={newQuotes} newMessages={newMessages} signOutAction={signOutAction}>
      {children}
    </AdminShell>
  );
}
