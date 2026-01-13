'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, Users, Calendar, Settings, Home, Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Wishlists', href: '/lists', icon: Gift },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'Exchanges', href: '/exchanges', icon: Calendar },
  { name: 'AI Suggestions', href: '/ai', icon: Sparkles },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Heart className="h-6 w-6 text-primary fill-primary" />
        <span className="font-semibold text-lg">OnlyFriends</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
