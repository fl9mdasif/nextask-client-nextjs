'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth   = pathname === '/login';

  return (
    <>
      {!isAuth && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuth && <Footer />}
    </>
  );
}
