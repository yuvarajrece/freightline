import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { CONTENT_RESOURCE_KEYS, RESOURCES, isResourceKey } from "@/core/config/resources";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/services/admin-context";

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }): Promise<Metadata> {
  const { resource } = await params;
  return { title: isResourceKey(resource) ? RESOURCES[resource].label : "Website content" };
}

export default async function ContentResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  // Shipments have their own section with tracking events.
  if (!isResourceKey(resource) || !CONTENT_RESOURCE_KEYS.includes(resource)) notFound();

  const { container } = await requireAdmin();
  const service = container.resourceService;
  const [rows, relationOptions] = await Promise.all([service.list(resource), service.relationOptions(resource)]);
  const config = service.config(resource);

  return (
    <>
      <PageHeader title={config.label} description={config.description} />

      <nav aria-label="Content types" className="scrollbar-none mb-6 flex gap-2 overflow-x-auto pb-1">
        {CONTENT_RESOURCE_KEYS.map((key) => (
          <Link
            key={key}
            href={`/admin/content/${key}`}
            aria-current={key === resource ? "page" : undefined}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              key === resource ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
            )}
          >
            {RESOURCES[key].label}
          </Link>
        ))}
      </nav>

      <ResourceManager config={config} rows={rows} relationOptions={relationOptions} />
    </>
  );
}
