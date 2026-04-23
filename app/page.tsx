import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LandingClient from "@/components/landing/LandingClient";

export default async function Page() {
  const supabase = await createClient();

  // 🔐 If user already logged in → skip landing
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  return <LandingClient />;
}