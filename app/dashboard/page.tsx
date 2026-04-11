import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/login/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold mb-4">Dashboard</h1>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
          <p><span className="text-white/50">Email:</span> {profile?.email}</p>
          <p><span className="text-white/50">Role:</span> {profile?.role}</p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-xl bg-white text-black px-5 py-3 font-medium"
          >
            Logout
          </button>
        </form>
      </div>
    </main>
  );
}