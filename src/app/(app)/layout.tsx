import { MobileNav, DesktopSidebar } from '@/components/MobileNav';
import { PageTransition } from '@/components/PageTransition';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
