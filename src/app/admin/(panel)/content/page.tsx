import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { CONTENT_RESOURCE_KEYS, RESOURCES } from "@/core/config/resources";
import { requireAdmin } from "@/services/admin-context";

export const metadata: Metadata = { title: "Website content" };

export default async function ContentIndexPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="Website content"
        description="Everything on the public site comes from here. Changes go live within seconds, no deploy needed."
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CONTENT_RESOURCE_KEYS.map((key) => {
          const resource = RESOURCES[key];
          return (
            <li key={key}>
              <Link
                href={`/admin/content/${key}`}
                className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 transition-[border-color,box-shadow] hover:border-signal-300 hover:shadow-[0_18px_40px_-28px_rgba(11,31,58,0.5)]"
              >
                <h2 className="text-lg font-semibold">{resource.label}</h2>
                <p className="mt-1 flex-1 text-sm text-ink-600">{resource.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-800 group-hover:text-signal-700">
                  Manage
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href="/admin/settings"
            className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 transition-[border-color,box-shadow] hover:border-signal-300 hover:shadow-[0_18px_40px_-28px_rgba(11,31,58,0.5)]"
          >
            <h2 className="text-lg font-semibold">Text and contact details</h2>
            <p className="mt-1 flex-1 text-sm text-ink-600">Headlines, section titles, contact details, footer text and social links.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-800 group-hover:text-signal-700">
              Edit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        </li>
      </ul>
    </>
  );
}
