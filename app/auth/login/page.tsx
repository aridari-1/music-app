import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const message = params?.message;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
        <p className="text-white/60 mb-6">Log in to your account.</p>

        {message ? (
          <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {message}
          </div>
        ) : null}

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-white text-black py-3 font-medium"
          >
            Log in
          </button>
        </form>
      </div>
    </main>
  );
}