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
    <html lang="en">
      <body className="bg-black text-white">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}