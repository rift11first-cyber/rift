import { Home, Search, Plus, VenetianMask, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
}

export function MobileNav({ activeTab }: MobileNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'anonymous', label: 'Unfiltered', icon: VenetianMask, href: '/anonymous' },
    { id: 'profile', label: 'Blend', icon: User, href: '/find-vibe' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ id, label, icon: Icon, href }) => (
          <a
            key={id}
            href={href}
            className={cn(
              'flex flex-col items-center p-2 transition-colors no-underline',
              activeTab === id ? 'text-primary' : 'text-muted-foreground'
            )}
            data-testid={`button-nav-${id}`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-1">{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}