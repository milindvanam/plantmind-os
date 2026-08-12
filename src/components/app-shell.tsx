"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  BookOpenText,
  Bell,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Factory,
  FileSearch,
  Gauge,
  Layers3,
  Menu,
  PanelLeftClose,
  Sparkles,
  Unplug,
  UserRound,
  X
} from "lucide-react";
import { IconButton, SimulatedDataLabel } from "@/components/ui";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ScenarioControls } from "@/features/scenario/scenario-controls";
import { ScenarioProvider } from "@/features/scenario/scenario-provider";

const navItems = [
  { href: "/briefing", label: "Briefing", icon: BookOpenText, permission: "Private preview" },
  { href: "/in-action", label: "In Action", icon: Layers3, permission: "Private preview" },
  { href: "/connect", label: "Connect", icon: Unplug, permission: "Private preview" },
  {
    href: "/command",
    label: "Executive Command",
    icon: Gauge,
    permission: "Executive + Operations"
  },
  { href: "/operations", label: "Plant Operations", icon: Factory, permission: "All demo roles" },
  {
    href: "/assets/P-204A",
    label: "Asset Intelligence",
    icon: Activity,
    permission: "All demo roles"
  },
  {
    href: "/investigations/INV-204",
    label: "Copilot Investigation",
    icon: FileSearch,
    permission: "Reliability + Operations"
  },
  {
    href: "/executives/INV-204",
    label: "Executive Briefs",
    icon: Sparkles,
    permission: "Executive + Plant Head"
  },
  {
    href: "/interventions/ACT-204",
    label: "Approval & Outcome",
    icon: ClipboardCheck,
    permission: "Plant Head approval"
  }
] as const;

function Logo() {
  return (
    <Link href="/command" className="logo" aria-label="PlantMind home">
      <span className="logo-mark">
        <span />
      </span>
      <span>
        <strong>PlantMind</strong>
        <small>Operational Intelligence</small>
      </span>
    </Link>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="primary-nav" aria-label="Primary navigation">
      {navItems.map(({ href, label, icon: Icon, permission }) => {
        const active =
          pathname === href || (href !== "/command" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            className={active ? "nav-item active" : "nav-item"}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            title={permission}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-head">
          <Logo />
          <IconButton
            className="mobile-only"
            label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} />
          </IconButton>
        </div>
        <div className="context-block">
          <span className="eyebrow">Enterprise</span>
          <strong>Aranya Process Industries</strong>
          <span>
            <Building2 size={14} /> Western Region
          </span>
        </div>
        <Navigation onNavigate={() => setMobileOpen(false)} />
        <div className="sidebar-foot">
          <div className="permission-note">
            <UserRound size={15} />
            <span>
              <strong>Executive Viewer</strong>
              <small>Fixed demo permissions</small>
            </span>
          </div>
          <SimulatedDataLabel />
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="shell-body">
        <header className="topbar">
          <div className="topbar-left">
            <IconButton
              className="mobile-only"
              label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={19} />
            </IconButton>
            <div className="site-selector">
              <Factory size={16} />
              <span>
                <small>Operating site</small>
                <strong>Dahej Plant · Reactor Line 2</strong>
              </span>
              <ChevronDown size={15} />
            </div>
          </div>
          <div className="topbar-actions">
            <button
              className="scenario-trigger"
              onClick={() => setScenarioOpen((value) => !value)}
              aria-expanded={scenarioOpen}
            >
              <ScenarioControls compact />
              <PanelLeftClose size={16} />
            </button>
            <ThemeSwitcher />
            <IconButton label="Notifications">
              <Bell size={17} />
              <span className="notification-dot">
                <span className="sr-only">1 notification</span>
              </span>
            </IconButton>
            <button className="profile" aria-label="Open user profile">
              <span>AK</span>
              <div>
                <strong>Anika Kapur</strong>
                <small>Executive Viewer</small>
              </div>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        {scenarioOpen && (
          <div className="scenario-drawer">
            <ScenarioControls />
          </div>
        )}
        <main id="main-content" className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/overview") return <>{children}</>;
  return (
    <ScenarioProvider>
      <ShellContent>{children}</ShellContent>
    </ScenarioProvider>
  );
}
