import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CelebrAI — Every Celebration, Thoughtfully Planned',
  description:
    'AI-powered celebration and event planner with deterministic catering calculators, real-time budget tracking, guest RSVP management, and run-sheet scheduling.',
  openGraph: {
    title: 'CelebrAI — Every Celebration, Thoughtfully Planned',
    description:
      'AI-powered celebration and event planner with deterministic catering calculators, real-time budget tracking, guest RSVP management, and run-sheet scheduling.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CelebrAI — Every Celebration, Thoughtfully Planned',
    description:
      'AI-powered celebration and event planner with deterministic catering calculators, real-time budget tracking, guest RSVP management, and run-sheet scheduling.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-stone-50 text-stone-900 antialiased" suppressHydrationWarning>
      <body className="h-full min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
