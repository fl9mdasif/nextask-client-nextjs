import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ToastProvider from '@/components/shared/ToastProvider';
import ThemeProvider from '@/components/shared/ThemeProvider';
import Shell from '@/components/shared/Shell';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexTask — Task Management & Image Annotation',
  description:
    'NexTask is a full-stack SaaS app for Kanban-style task management and image polygon annotation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex flex-col min-h-screen bg-[#0a0a0f] text-[#fafafa]"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Shell>{children}</Shell>
        </ThemeProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
