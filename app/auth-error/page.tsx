export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const message = params?.message || "Something went wrong.";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
        <h1 className="text-2xl font-semibold mb-3">Authentication error</h1>
        <p className="text-red-200">{message}</p>
      </div>
    </main>
  );
}