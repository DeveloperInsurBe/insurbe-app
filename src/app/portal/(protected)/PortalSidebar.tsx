"use client";

import {
  BarChart3,
  Euro,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

import PortalNav, { type NavGroup } from "@/app/components/portal/PortalNav";

type PortalRole = "partner" | "agent";

type PortalUser = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
};

type PortalSidebarProps = {
  role: PortalRole;
  user: PortalUser;
};

const partnerGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/portal/dashboard", label: "Partner Program", icon: LayoutDashboard },
      { href: "/portal/conversions-list", label: "Conversions", icon: BarChart3 },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/portal/partner-data", label: "Partner Data", icon: User }],
  },
  {
    label: "Resources",
    items: [
      { href: "/portal/marketing-assets", label: "Marketing Assets", icon: Megaphone },
      { href: "/portal/documents", label: "Documents", icon: FileText },
      { href: "/portal/faq-page", label: "FAQ", icon: HelpCircle },
      { href: "/portal/contact", label: "Contact", icon: Phone },
    ],
  },
];

const agentGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/portal/dashboard", label: "Agent Dashboard", icon: LayoutDashboard },
      { href: "/portal/applications", label: "Applications", icon: FileText },
      { href: "/portal/commissions", label: "Commissions", icon: Euro },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/portal/profile", label: "Agent Profile", icon: User },
      { href: "/portal/verification", label: "Verification", icon: ShieldCheck },
    ],
  },
];

/**
 * Partner and agent portal navigation: same layout as the Sales Leader and
 * admin portals, in the partner portal's glass look.
 */
export default function PortalSidebar({ role, user }: PortalSidebarProps) {
  const name =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.name || (role === "partner" ? "Partner" : "Agent");

  return (
    <PortalNav
      name={name}
      email={user?.email || ""}
      brandLabel={role === "partner" ? "Partner portal" : "Agent portal"}
      homeHref="/portal/dashboard"
      groups={role === "partner" ? partnerGroups : agentGroups}
      logoutUrl={`/partner-access/login?type=${role}`}
      storageKey="portal-sidebar-collapsed"
      glass
    />
  );
}
