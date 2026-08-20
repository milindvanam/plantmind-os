"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const workspaces = {
  executive: {
    label: "Executive Command views",
    items: [
      { href: "/briefing", label: "Briefing" },
      { href: "/command", label: "Live Command" }
    ]
  },
  decisions: {
    label: "Decisions and actions workflow",
    items: [
      { href: "/investigations/INV-204", label: "Investigation" },
      { href: "/interventions/ACT-204", label: "Approval" },
      { href: "/executives/INV-204", label: "Executive Outcome" }
    ]
  }
} as const;

export function WorkspaceTabs({ workspace }: { workspace: keyof typeof workspaces }) {
  const pathname = usePathname();
  const configuration = workspaces[workspace];
  return (
    <nav className="workspace-tabs" aria-label={configuration.label}>
      {configuration.items.map((item, index) => {
        const active = pathname === item.href;
        return (
          <Link
            href={item.href as Route}
            key={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? "active" : undefined}
          >
            <small>{String(index + 1).padStart(2, "0")}</small>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
