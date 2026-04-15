import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import PlayerBar from "@/components/ui/PlayerBar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* 🔝 TOP NAV */}
      <Navbar />

      {/* 🧱 MAIN CONTENT */}
      <div className="mx-auto w-full max-w-7xl flex-1">
        <main className="min-h-[100vh] px-4 sm:px-6 lg:px-8 pb-[140px] md:pb-[120px]">
          {children}
        </main>
      </div>

      {/* 📱 MOBILE NAV */}
      <BottomNav />

      {/* 🎧 GLOBAL PLAYER */}
      <PlayerBar />

    </div>
  );
}