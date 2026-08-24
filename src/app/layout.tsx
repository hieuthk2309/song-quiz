import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: 'Vpop Master Quiz - Thử Thách Giai Điệu',
  description: 'Thử thách kiến thức âm nhạc V-pop đỉnh cao với hiệu ứng sóng nhạc WebGL, phòng chơi nhiều người và bảng xếp hạng.',
  keywords: ['Vpop', 'Quiz', 'Music Game', 'Âm nhạc', 'Game âm nhạc', 'Đoán bài hát'],
  authors: [{ name: 'Vpop Master Quiz Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
