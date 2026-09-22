import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "Fortify.me - AI-Powered Supplement Intelligence",
  description:
    "Track, research, and optimize your supplement routine with AI-powered insights backed by science.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen antialiased font-display">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg bg-emerald-800 text-white focus:px-4 focus:py-2.5 focus:text-base focus:font-bold focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Skip to main content
        </a>
        <Toaster>
          <AuthProvider>
            <Navbar />
            <main id="main-content">{children}</main>
          </AuthProvider>
        </Toaster>
      </body>
    </html>
  );
}
