import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { requireAdmin } from "@/services/admin-context";

export const metadata: Metadata = { title: "Shipments" };

export default async function ShipmentsPage() {
  const { container } = await requireAdmin();
  const service = container.resourceService;
  const [rows, relationOptions] = await Promise.all([service.list("shipments"), service.relationOptions("shipments")]);

  return (
    <>
      <PageHeader
        title="Shipments"
        description="Create a consignment, then post tracking updates. Customers look it up with the tracking code on the website."
      />
      <ResourceManager
        config={service.config("shipments")}
        rows={rows}
        relationOptions={relationOptions}
        detailBasePath="/admin/shipments"
        detailLabel="Track"
      />
    </>
  );
}
