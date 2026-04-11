import { signUp } from "./actions";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold mb-2">Create account</h1>
        <p className="text-white/60 mb-6">
          Join as an artist or a buyer.
        </p>

        <form action={signUp} className="space-y-4">
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
              minLength={8}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Role</label>
            <select
              name="role"
              defaultValue="buyer"
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            >
              <option value="buyer">Buyer</option>
              <option value="artist">Artist</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-white text-black py-3 font-medium"
          >
            Sign up
          </button>
        </form>
      </div>
    </main>
  );
}