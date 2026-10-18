"use client";

import {
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  NotebookPen,
  PackageSearch,
  Settings,
  Truck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ToastProvider } from "./Toaster";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface AdminShellProps {
  email: string;
  newQuotes: number;
  newMessages: number;
  signOutAction: () => Promise<void>;
  children: ReactNode;
}

export function AdminShell({ email, newQuotes, newMessages, signOutAction, children }: AdminShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const links: NavLink[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Quote requests", icon: Inbox, badge: newQuotes },
    { href: "/admin/messages", label: "Messages", icon: Mail, badge: newMessages },
    { href: "/admin/subscribers", label: "Subscribers", icon: Users },
    { href: "/admin/shipments", label: "Shipments", icon: PackageSearch },
    { href: "/admin/notes", label: "Notes", icon: NotebookPen },
    { href: "/admin/content", label: "Website content", icon: FileText },
    { href: "/admin/settings", label: "Site settings", icon: Settings },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {links.map(({ href, label, icon: Icon, badge }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(href) ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
          )}
        >
          <Icon className={cn("size-[18px]", isActive(href) && "text-signal-400")} aria-hidden="true" />
          <span className="flex-1">{label}</span>
          {badge ? (
            <span className="rounded-full bg-signal-400 px-2 py-0.5 text-xs font-bold text-ink-950 tabular-nums">
              {badge > 99 ? "99+" : badge}
              <span className="sr-only"> new</span>
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );

  const account = (
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-xs text-ink-400" title={email}>
        Signed in as
        <span className="block truncate text-sm font-medium text-ink-100">{email}</span>
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Link href="/" target="_blank" className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-center text-sm font-medium text-ink-100 hover:bg-white/5">
          View site
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="Sign out"
            className="grid size-9 place-items-center rounded-lg border border-white/15 text-ink-100 hover:bg-white/5"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 text-white">
      <span className="grid size-9 place-items-center rounded-lg bg-signal-400 text-ink-950">
        <Truck className="size-5" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-semibold">Control room</span>
    </Link>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col bg-ink-950 lg:flex">
          <div className="px-5 pt-5">{brand}</div>
          {nav}
          {account}
        </aside>

        <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink-950 px-4 lg:hidden">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-lg text-white hover:bg-white/10"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </header>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink-950/60" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-ink-950">
              <div className="flex items-center justify-between px-5 pt-5">
                {brand}
                <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-9 place-items-center rounded-lg text-white hover:bg-white/10">
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>
              {nav}
              {account}
            </div>
          </div>
        ) : null}

        <main id="admin-main" className="min-w-0 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
