import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'TIDESK – Mesa de Ayuda Universitaria | Universidad Nacional de Cañete',
  description:
    'Sistema Integral de Mesa de Ayuda Universitaria (REQ, INC, CRQ) de la Universidad Nacional de Cañete.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-[#F4F7FB] text-[#071B49]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
