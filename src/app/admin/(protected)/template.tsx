"use client";

import { usePathname } from "next/navigation";

/**
 * Re-mounts on every admin navigation, so each page fades in and its
 * top-level sections rise in one after another (see .admin-stagger in
 * globals.css). Purely visual: pages render exactly as before.
 * The dashboard animates its own sections, so it only gets the fade.
 */
export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ownAnimations = pathname === "/admin/dashboard";

  return (
    <div className={ownAnimations ? "admin-page-in" : "admin-page-in admin-stagger"}>
      {children}
    </div>
  );
}
