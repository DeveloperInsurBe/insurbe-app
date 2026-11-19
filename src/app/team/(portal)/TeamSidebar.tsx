"use client";

import { BarChart3, Briefcase, LineChart, Phone, User, Users } from "lucide-react";

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
export default function TeamSidebar({ name, email }: { name: string; email: string }) {
  return (
    <PortalNav
      name={name}
      email={email}
      brandLabel="Sales Leader"
      homeHref="/team/dashboard"
      groups={GROUPS}
      logoutUrl="/team/login"
      storageKey="team-sidebar-collapsed"
    />
  );
}
