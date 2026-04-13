import "./globals.css";
import AppShell from "@/components/layout/AppShell";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}