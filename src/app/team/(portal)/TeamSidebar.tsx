"use client";

import { BarChart3, Briefcase, FileSpreadsheet, LineChart, Phone, User, Users } from "lucide-react";

import PortalNav, { type NavGroup } from "@/app/components/portal/PortalNav";

const GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/team/dashboard", label: "Dashboard", icon: BarChart3 },
      { href: "/team/conversions", label: "Conversions", icon: LineChart },
    ],
  },
  {
    label: "My team",
    items: [
      { href: "/team/partners", label: "Partners", icon: Briefcase },
      { href: "/team/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/team/my-data", label: "My data", icon: User }],
  },
  {
    label: "Support",
    items: [{ href: "/team/contact", label: "Contact", icon: Phone }],
  },
];

/** Sales Leader portal navigation. */
export default function TeamSidebar({ name, email, showDakBulk = false }: { name: string; email: string; showDakBulk?: boolean }) {
  // "DAK bulk uploads" only while the feature is switched on.
  const groups = showDakBulk
    ? GROUPS.map((group) =>
        group.label === "My team"
          ? { ...group, items: [...group.items, { href: "/team/dak-bulk", label: "DAK bulk uploads", icon: FileSpreadsheet }] }
          : group,
      )
    : GROUPS;
  return (
    <PortalNav
      name={name}
      email={email}
      brandLabel="Sales Leader"
      homeHref="/team/dashboard"
      groups={groups}
      logoutUrl="/team/login"
      storageKey="team-sidebar-collapsed"
    />
  );
}
