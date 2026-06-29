import { redirect } from "next/navigation";

export default function PartnerSignupRedirectPage() {
  redirect("/partner-access/signup?type=partner");
}

