import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { LanguageProvider } from "@/context/LanguageProvider";

export const metadata = {
  title: "Naluma Music",
  description: "Discover and own music directly from artists",

  // 🔥 FAVICON + APP ICONS
  icons: {
    icon: "/icon.png",          // browser tab
    shortcut: "/icon.png",
    apple: "/icon.png",         // iPhone home screen
  },

  // 🔥 WHEN SHARING LINKS (VERY IMPORTANT)
  openGraph: {
    title: "Naluma Music",
    description: "Discover and own music directly from artists",
    url: "https://www.nalumamusic.com",
    siteName: "Naluma Music",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
      },
    ],
    type: "website",
  },

  // 🔥 TWITTER / X PREVIEW
  twitter: {
    card: "summary_large_image",
    title: "Naluma Music",
    description: "Discover and own music directly from artists",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased overflow-x-hidden">

        {/* 🌌 GLOBAL BACKGROUND */}
        <div className="pointer-events-none fixed inset-0 -z-10">

          {/* TOP GRADIENT */}
          <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-purple-900/40 via-black/40 to-transparent" />

          {/* CENTER GLOW */}
          <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-3xl" />

          {/* SIDE LIGHT */}
          <div className="absolute right-[-100px] top-[200px] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl" />

          {/* DEPTH */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%)]" />
        </div>

        {/* 🧠 APP STRUCTURE */}
        <LanguageProvider>
          <AppShell>
            {/* 🔥 FIX NAV OVERLAP */}
            <div className="relative pt-16">
              {children}
            </div>
          </AppShell>
        </LanguageProvider>

      </body>
    </html>
  );
}