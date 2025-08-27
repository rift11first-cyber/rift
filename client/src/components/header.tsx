import { useAuth } from '@/hooks/use-auth';
import { CharacterAvatar } from './character-avatar';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHARACTERS } from '@shared/schema';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm">🎓</span>
            </div>
            <span className="text-xl font-bold text-primary">CollegeVibe</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-primary font-medium border-b-2 border-primary pb-1" data-testid="link-feed">
              Feed
            </a>
            <a href="/find-vibe" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-find-vibe">
              Find Your Vibe
            </a>
            <a href="/anonymous" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-anonymous">
              Anonymous Corner
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-connect">
              Connect Offline
            </a>
          </nav>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
            
            {user && (
              <div className="flex items-center space-x-3">
                {user.character && (
                  <CharacterAvatar character={user.character} size="md" />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium" data-testid="text-fullname">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-user-info">
                    @{user.username} • {user.character ? CHARACTERS[user.character].name : 'New User'} • {user.college}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground"
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
