import Player from "@/components/ui/Player";

export default function SongPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-black text-white flex justify-center items-center">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl mb-6">Song Player</h1>
        <Player songId={params.id} />
      </div>
    </main>
  );
}