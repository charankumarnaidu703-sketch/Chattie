import { MobileNav, DesktopSidebar } from '@/components/MobileNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
