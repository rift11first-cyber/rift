import { CHARACTERS, CharacterTypeValue } from '@shared/schema';
import { cn } from '@/lib/utils';

interface CharacterAvatarProps {
  character: CharacterTypeValue;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGlow?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-xl', 
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-20 h-20 text-4xl',
};

const characterGradients = {
  strategist: 'character-strategist',
  explorer: 'character-explorer',
  guardian: 'character-guardian',
  maverick: 'character-maverick',
  artist: 'character-artist',
  visionary: 'character-visionary',
  healer: 'character-healer',
  rebel: 'character-rebel',
  dreamer: 'character-dreamer',
  connector: 'character-connector',
};

export function CharacterAvatar({ character, size = 'md', className, showGlow = false }: CharacterAvatarProps) {
  const characterData = CHARACTERS[character];
  
  return (
    <div
      className={cn(
        'character-badge rounded-full flex items-center justify-center font-bold cursor-pointer transition-all duration-300 hover:scale-105',
        sizeClasses[size],
        characterGradients[character],
        showGlow && 'character-glow',
        className
      )}
      data-testid={`character-avatar-${character}`}
    >
      <span>{characterData.emoji}</span>
    </div>
  );
}
