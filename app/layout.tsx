import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MonadRaffle - Warhorse Giveaway",
  description:
    "Join the Warhorse Monad raffle giveaway. Submit your EVM address for a chance to win Monad tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>MonadRaffle - Warhorse Giveaway</title>
        <meta
          name="description"
          content="Join the Warhorse Monad raffle giveaway. Submit your EVM address for a chance to win Monad tokens"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <body className={inter.className}>
        {children}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm">
              Raffle giveaway made by{" "}
              <a
                href="https://x.com/agungfathul"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                @agungfathul
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
