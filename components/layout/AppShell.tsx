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
      <div className="w-full flex-1">

        <main className="min-h-[100vh] px-0 sm:px-6 lg:px-8 pb-[160px] md:pb-[120px]">

          {/* 🔥 MOBILE: FULL WIDTH / DESKTOP: CENTERED */}
          <div className="w-full sm:max-w-7xl sm:mx-auto">
            {children}
          </div>

        </main>

      </div>

      {/* 📱 MOBILE NAV */}
      <BottomNav />

      {/* 🎧 GLOBAL PLAYER */}
      <PlayerBar />

    </div>
  );
}