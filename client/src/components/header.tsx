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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-accent"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-primary-foreground text-sm">🎓</span>
              </div>
              <span className="text-xl font-bold text-primary tracking-tight">Rift</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <a 
              href="/" 
              className="relative px-4 py-2 text-primary font-semibold rounded-lg bg-primary/10 transition-all duration-200 hover:bg-primary/15" 
              data-testid="link-feed"
            >
              Home
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full"></div>
            </a>
            <a 
              href="/find-vibe" 
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 font-medium" 
              data-testid="link-find-vibe"
            >
              Blend
            </a>
            <a 
              href="/anonymous" 
              className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 font-medium" 
              data-testid="link-anonymous"
            >
              Unfiltered
            </a>
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-accent transition-colors" 
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-md animate-pulse">
                3
              </span>
            </Button>
            
            {user && (
              <div className="flex items-center space-x-3 pl-2 border-l border-border">
                {user.character && (
                  <CharacterAvatar character={user.character} size="md" />
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-foreground" data-testid="text-fullname">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight" data-testid="text-user-info">
                    @{user.username} • {user.character ? CHARACTERS[user.character].name : 'New User'} • {user.college}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
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