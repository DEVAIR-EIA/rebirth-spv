import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'ReBirth — SPV factory on Solana',
  description:
    'Deploy a compliant single-purpose investment vehicle to Solana in 60 seconds. Token-2022 instruments with protocol-enforced transfer compliance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fonts are loaded at runtime via Google Fonts CSS rather than next/font/google
          because the build environment has no outbound access to fonts.googleapis.com.
          font-display:swap keeps text readable during fetch.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="bg-paper text-ink font-body min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
