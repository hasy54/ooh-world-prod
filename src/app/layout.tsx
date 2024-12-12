import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'OOH WORLD',
  description: 'Manage Our OOH Media & Booking Easily',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <LayoutWrapper>{children}</LayoutWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
