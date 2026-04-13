import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">Account</h1>

      <p className="text-white/70 mb-4">
        {user?.email}
      </p>

      <form action="/auth/logout" method="post">
        <button className="bg-white text-black px-4 py-2 rounded-lg">
          Logout
        </button>
      </form>
    </main>
  );
}