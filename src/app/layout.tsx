import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/providers";
import { AppShell } from "./_components/app-shell";

export const metadata: Metadata = {
  title: "Fit Space",
  description:
    "Discover elite coaches, gyms, and adaptive training plans tuned to your goals.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

