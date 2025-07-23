import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { StagewiseToolbar } from '@stagewise/toolbar-next';
import ReactPlugin from '@stagewise-plugins/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'cliky - Fast, flawless MVP Building tool for vive coding',
  description: 'Transform your ideas into production-ready MVPs with AI-powered PRD generation and task breakdown',
  icons: {
    icon: '/image/logo_symbol.png',
    apple: '/image/logo_symbol.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
