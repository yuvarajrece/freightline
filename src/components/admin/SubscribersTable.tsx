"use client";

import { Download } from "lucide-react";
import { deleteSubscriberAction } from "@/app/admin/actions";
import type { Subscriber } from "@/core/domain/models";
import { formatDateTime } from "@/lib/utils";
import { ConfirmButton } from "./ConfirmButton";
import { EmptyState } from "./PageHeader";

export function SubscribersTable({ subscribers }: { subscribers: Subscriber[] }) {
  return (
    <div>
      <div className="mb-5 flex justify-end">
        {/* A file download from a route handler: a plain anchor is correct, next/link would try a page navigation. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/admin/export/subscribers"
          download
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-900 hover:border-ink-400"
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </a>
      </div>

      {subscribers.length === 0 ? (
        <EmptyState title="No subscribers yet" description="People who join the newsletter in the website footer appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <caption className="sr-only">Newsletter subscribers</caption>
            <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Email</th>
                <th scope="col" className="px-4 py-3 font-semibold">Joined</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-3 font-medium">{subscriber.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-600">{formatDateTime(subscriber.created_at)}</td>
                  <td className="px-4 py-2 text-right">
                    <ConfirmButton
                      ariaLabel={`Remove ${subscriber.email}`}
                      confirmText={`Remove ${subscriber.email} from the list?`}
                      action={() => deleteSubscriberAction(subscriber.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
