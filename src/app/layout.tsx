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
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased font-display">
        <Toaster>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </Toaster>
      </body>
    </html>
  );
}
