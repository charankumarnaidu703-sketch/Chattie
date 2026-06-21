'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, Mail, Phone, Building2, Clock, MoreHorizontal, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/call-notes', label: 'Call Notes', icon: Phone },
  { href: '/follow-ups', label: 'Follow-ups', icon: Clock },
  { href: '/company-info', label: 'Company Info', icon: Building2 },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const mainItems = navItems.slice(0, 3);
  const overflowItems = navItems.slice(3);

  // Check if any overflow item is active
  const isOverflowActive = overflowItems.some((item) =>
    pathname === item.href || pathname?.startsWith(item.href + '/')
  );

  return (
    <>
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-3xl shadow-[0_12px_32px_-4px_rgba(11,28,48,0.1)] border border-outline-variant/10 flex justify-around items-center py-2 px-1">
          {mainItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-200 active:scale-90',
                  isActive
                    ? 'text-primary bg-surface-container-low/50'
                    : 'text-outline hover:text-on-surface-variant'
                )}
                aria-label={item.label}
              >
                <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5]')} aria-hidden="true" />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}

          {/* Meer Button */}
          <button
            onClick={() => setIsOpen(true)}
            className={cn(
              'flex items-center justify-center h-11 w-11 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer',
              isOverflowActive
                ? 'text-primary bg-surface-container-low/50'
                : 'text-outline hover:text-on-surface-variant'
            )}
            aria-label="More navigation options"
          >
            <MoreHorizontal className={cn('h-6 w-6', isOverflowActive && 'stroke-[2.5]')} aria-hidden="true" />
            <span className="sr-only">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          onClose={() => setIsOpen(false)}
          side="bottom"
          className="rounded-t-3xl border-t border-outline-variant/10 p-6 bg-surface-container-lowest"
        >
          <SheetHeader className="text-left pb-4 border-b border-outline-variant/10">
            <SheetTitle className="font-headline font-bold text-on-background">More options</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-2">
            {overflowItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-body font-semibold transition-all duration-200 min-h-[48px] active:scale-98',
                    isActive
                      ? 'bg-surface-container text-primary shadow-sm border border-outline-variant/10'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-background'
                  )}
                >
                  <div className={cn(
                    'p-2.5 rounded-xl transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'bg-surface-container-low text-outline'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setIsMounted(true);
    const savedCollapse = localStorage.getItem('sidebar_collapsed');
    if (savedCollapse === 'true') {
      setIsCollapsed(true);
    }
    
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme, isMounted]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (!isMounted) {
    // Avoid hydration mismatch by rendering a static placeholder sidebar
    return (
      <aside className="hidden md:flex flex-col w-64 bg-surface-container-low h-screen sticky top-0 border-r border-outline-variant/10">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
            <span className="text-white font-headline font-extrabold text-lg">C</span>
          </div>
          <div>
            <h1 className="text-lg font-headline font-extrabold text-primary tracking-tight">Chattie</h1>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-surface-container-low h-screen sticky top-0 border-r border-outline-variant/10 transition-all duration-300 relative',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Collapse Trigger Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-7 h-6 w-6 rounded-full border border-outline-variant/20 bg-surface-container-lowest text-outline hover:text-on-surface-variant flex items-center justify-center shadow-ambient hover:scale-105 active:scale-95 transition-all cursor-pointer z-50"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Logo */}
      <div className={cn('flex items-center py-6', isCollapsed ? 'justify-center' : 'px-6 gap-3')}>
        <Link href="/dashboard" className="flex items-center gap-3 active:scale-98 transition-transform">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-ambient">
            <span className="text-white font-headline font-extrabold text-lg">C</span>
          </div>
          {!isCollapsed && (
            <div className="animate-slide-in">
              <h1 className="text-lg font-headline font-extrabold text-primary tracking-tight">Chattie</h1>
              <p className="font-label text-[10px] text-outline uppercase tracking-widest">Dashboard</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'relative flex items-center transition-all duration-200 min-h-[44px]',
                isCollapsed
                  ? 'justify-center w-12 h-12 mx-auto rounded-2xl'
                  : 'gap-3 px-4 py-3 rounded-2xl text-sm font-body font-semibold',
                isActive
                  ? 'bg-surface-container-lowest text-primary shadow-ambient font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-background'
              )}
            >
              {/* Active Accent Indicator */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-primary rounded-r-full" />
              )}
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'stroke-[2.5]')} />
              {!isCollapsed && <span className="animate-slide-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Theme Toggle */}
      <div className={cn('py-5 flex flex-col gap-4 border-t border-outline-variant/10', isCollapsed ? 'items-center' : 'px-6')}>
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center gap-2 text-outline hover:text-on-surface-variant transition-colors cursor-pointer',
            isCollapsed ? 'p-2 rounded-full hover:bg-surface-container' : 'text-xs font-bold uppercase tracking-wider'
          )}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4.5 w-4.5 text-primary" />
              {!isCollapsed && <span className="animate-slide-in">Light mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-4.5 w-4.5" />
              {!isCollapsed && <span className="animate-slide-in">Dark mode</span>}
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="animate-slide-in">
            <p className="font-label text-[10px] text-outline uppercase tracking-widest">Chattie v1.0</p>
            <p className="font-label text-[10px] text-outline-variant mt-0.5">AI Customer Service</p>
          </div>
        )}
      </div>
    </aside>
  );
}
