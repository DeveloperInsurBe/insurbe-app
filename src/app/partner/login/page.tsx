import { redirect } from "next/navigation";

export default function PartnerLoginRedirectPage() {
  redirect("/partner-access/login?type=partner");
}

