import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl">
        <main className="min-h-[100vh] pb-24 md:pb-8">{children}</main>
      </div>

      <BottomNav />
    </div>
  );
}