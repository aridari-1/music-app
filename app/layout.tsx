import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { LanguageProvider } from "@/context/LanguageProvider";

export const metadata = {
  title: "Musique",
  description: "Buy songs directly from artists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="relative min-h-screen bg-[#0a0a0a] text-white antialiased">

        {/* 🔥 GLOBAL BACKGROUND LAYERS */}
        <div className="pointer-events-none fixed inset-0 -z-10">

          {/* TOP GRADIENT (Apple Music style) */}
          <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/40 via-black/40 to-transparent" />

          {/* RADIAL GLOW */}
          <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl" />

          {/* SIDE LIGHT */}
          <div className="absolute right-[-100px] top-[200px] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl" />

          {/* GLOBAL NOISE / DEPTH */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%)]" />
        </div>

        {/* 🧠 APP STRUCTURE */}
        <LanguageProvider>
          <AppShell>
            <div className="relative z-10">
              {children}
            </div>
          </AppShell>
        </LanguageProvider>

      </body>
    </html>
  );
}