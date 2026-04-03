'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Mail, Building2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/conversations', label: 'Gesprekken', icon: MessageSquare },
  { href: '/emails', label: 'E-mails', icon: Mail },
  { href: '/company-info', label: 'Bedrijf', icon: Building2 },
  { href: '/follow-ups', label: 'Follow-ups', icon: Clock },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_12px_32px_-4px_rgba(11,28,48,0.1)] border border-outline-variant/10 flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 active:scale-90 min-h-[48px]',
                isActive
                  ? 'text-primary bg-surface-container-low/50'
                  : 'text-outline hover:text-on-surface-variant'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="font-label font-bold text-[10px] uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-container-low h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-ambient">
          <span className="text-white font-headline font-extrabold text-lg">C</span>
        </div>
        <div>
          <h1 className="text-lg font-headline font-extrabold text-primary tracking-tight">Chattie</h1>
          <p className="font-label text-[10px] text-outline uppercase tracking-widest">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-body font-semibold transition-all duration-200',
                isActive
                  ? 'bg-surface-container-lowest text-primary shadow-ambient'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-background'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5">
        <p className="font-label text-[10px] text-outline uppercase tracking-widest">Chattie v1.0</p>
        <p className="font-label text-[10px] text-outline-variant mt-0.5">AI Klantenservice</p>
      </div>
    </aside>
  );
}
