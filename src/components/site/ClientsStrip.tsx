import { Marquee } from "@/components/motion/Marquee";
import type { Client } from "@/core/domain/models";

export function ClientsStrip({ clients, title }: { clients: Client[]; title: string }) {
  if (clients.length === 0) return null;

  return (
    <section aria-label={title || "Our clients"} className="border-b border-ink-100 bg-paper py-10">
      <div className="mx-auto max-w-7xl px-5">
        {title ? <p className="mb-6 text-center text-sm font-medium text-ink-500">{title}</p> : null}
        <Marquee duration={Math.max(clients.length * 5, 30)} className="[--gap:3.5rem]">
          {clients.map((client) => (
            <span key={client.id} className="font-display text-2xl font-semibold whitespace-nowrap text-ink-300">
              {client.name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
