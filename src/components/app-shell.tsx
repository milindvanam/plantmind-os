"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  ChevronDown,
  Database,
  Factory,
  FileSearch,
  Gauge,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  UserRound,
  X
} from "lucide-react";
import { Badge, IconButton, SimulatedDataLabel } from "@/components/ui";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ScenarioControls } from "@/features/scenario/scenario-controls";
import { ScenarioProvider } from "@/features/scenario/scenario-provider";

const navItems = [
  { href: "/overview", label: "Overview", icon: Sparkles, permission: "Private preview" },
  {
    href: "/command",
    label: "Executive Command",
    icon: Gauge,
    permission: "Briefing + live priorities"
  },
  { href: "/virtual-plant", label: "Virtual Plant", icon: Factory, permission: "All demo roles" },
  { href: "/operations", label: "Plant Operations", icon: Factory, permission: "All demo roles" },
  {
    href: "/assets/P-204A",
    label: "Asset Intelligence",
    icon: Activity,
    permission: "All demo roles"
  },
  {
    href: "/investigations/INV-204",
    label: "Decisions & Actions",
    icon: FileSearch,
    permission: "Investigation + approval + outcome"
  },
  {
    href: "/real-data",
    label: "Data & Integrations",
    icon: Database,
    permission: "All demo roles"
  }
] as const;

const consolidatedRoutes: Readonly<Record<string, readonly string[]>> = {
  "/command": ["/command", "/briefing"],
  "/investigations/INV-204": [
    "/investigations/INV-204",
    "/interventions/ACT-204",
    "/executives/INV-204"
  ]
};

function isActiveDestination(pathname: string, href: string) {
  const destinations = consolidatedRoutes[href] ?? [href];
  return destinations.some(
    (destination) => pathname === destination || pathname.startsWith(`${destination}/`)
  );
}

function Logo() {
  return (
    <Link href="/overview" className="logo" aria-label="PlantMind home">
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
      {navItems.map(({ href, label, icon: Icon, permission }, index) => {
        const active = isActiveDestination(pathname, href);
        return (
          <Link
            key={href}
            href={href as Route}
            className={active ? "nav-item active" : "nav-item"}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            title={permission}
          >
            <small>{String(index + 1).padStart(2, "0")}</small>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const realDataMode = pathname.startsWith("/real-data");
  const virtualPlantMode = pathname.startsWith("/virtual-plant");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  return (
    <div className={sidebarHidden ? "app-shell sidebar-hidden" : "app-shell"}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="sidebar-head">
          <Logo />
          <IconButton
            className="desktop-only"
            label="Hide sidebar"
            onClick={() => setSidebarHidden(true)}
          >
            <PanelLeftClose size={18} />
          </IconButton>
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
          <strong>
            {realDataMode
              ? "PlantMind Process Industries"
              : virtualPlantMode
                ? "Apex Specialty Chemicals Ltd."
                : "Aranya Process Industries"}
          </strong>
          <span>
            <Building2 size={14} />{" "}
            {realDataMode
              ? "Maharashtra demo context"
              : virtualPlantMode
                ? "PM-01 simulation environment"
                : "Western Region"}
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
          {realDataMode ? (
            <Badge tone="real">
              <Database size={13} />
              Real industrial data
            </Badge>
          ) : (
            <SimulatedDataLabel />
          )}
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
            {sidebarHidden && (
              <IconButton
                className="desktop-only"
                label="Show sidebar"
                onClick={() => setSidebarHidden(false)}
              >
                <PanelLeftOpen size={18} />
              </IconButton>
            )}
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
                <strong>
                  {realDataMode
                    ? "Maharashtra Demo Site · Hydraulic Rig"
                    : virtualPlantMode
                      ? "PM-01 Manufacturing Plant · ASC-100"
                      : "Dahej Plant · Reactor Line 2"}
                </strong>
              </span>
              <ChevronDown size={15} />
            </div>
          </div>
          <div className="topbar-actions">
            {realDataMode ? (
              <Badge tone="real">
                <Database size={13} />
                REAL INDUSTRIAL DATA
              </Badge>
            ) : virtualPlantMode ? (
              <Badge tone="simulated">
                <Activity size={13} /> PM-01 SIMULATION
              </Badge>
            ) : (
              <button
                className="scenario-trigger"
                onClick={() => setScenarioOpen((value) => !value)}
                aria-expanded={scenarioOpen}
              >
                <ScenarioControls compact />
                <PanelLeftClose size={16} />
              </button>
            )}
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
        {!realDataMode && scenarioOpen && (
          <div className="scenario-drawer">
            <ScenarioControls />
          </div>
        )}
        <main
          id="main-content"
          className={virtualPlantMode ? "main-content virtual-plant-main" : "main-content"}
        >
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
