import { Home, Search, Plus, VenetianMask, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'anonymous', label: 'Anonymous', icon: VenetianMask },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-col items-center p-2 transition-colors',
              activeTab === id ? 'text-primary' : 'text-muted-foreground'
            )}
            data-testid={`button-nav-${id}`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
