import { MessageCircle } from "lucide-react";

/** Floating chat shortcut. Renders only when a WhatsApp number is set in the admin dashboard. */
export function FloatingWhatsApp({ number, brandName }: { number: string; brandName: string }) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${brandName} on WhatsApp`}
      className="fixed right-5 bottom-5 z-40 grid size-14 place-items-center rounded-full bg-route-500 text-white shadow-[0_12px_30px_-8px_rgba(15,143,98,0.8)] transition-transform hover:scale-105 focus-visible:scale-105"
    >
      <MessageCircle className="size-7" aria-hidden="true" />
    </a>
  );
}
