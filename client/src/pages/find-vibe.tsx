import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { CharacterAvatar } from '@/components/character-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, CHARACTERS, CharacterTypeValue } from '@shared/schema';
import { MatchResult } from '@/types';
import { Plus, Heart } from 'lucide-react';

export default function FindVibePage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    if (!user?.character) return;

    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    if (!user?.character) return;

    try {
      // Get all users from the same college excluding current user
      const usersQuery = query(
        collection(db, 'users'),
        where('college', '==', user.college),
        where('profileComplete', '==', true),
        limit(50)
      );

      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as User)
        .filter(u => u.id !== user.id && u.character);

      // Implement 2:1 matching algorithm
      const differentCharacterUsers = allUsers.filter(u => u.character !== user.character);
      const sameCharacterUsers = allUsers.filter(u => u.character === user.character);

      // Calculate match percentages (simplified)
      const calculateMatchPercentage = (targetUser: User): number => {
        if (targetUser.character === user.character) return 95; // Same character high compatibility
        
        // Different character compatibility based on character traits
        const compatibilityMap: Record<CharacterTypeValue, CharacterTypeValue[]> = {
          strategist: ['explorer', 'visionary'],
          explorer: ['strategist', 'dreamer'], 
          guardian: ['healer', 'connector'],
          maverick: ['rebel', 'artist'],
          artist: ['maverick', 'dreamer'],
          visionary: ['strategist', 'rebel'],
          healer: ['guardian', 'connector'],
          rebel: ['maverick', 'visionary'],
          dreamer: ['explorer', 'artist'],
          connector: ['healer', 'guardian']
        };

        if (user.character && compatibilityMap[user.character]?.includes(targetUser.character!)) {
          return Math.floor(Math.random() * 20) + 75; // 75-95%
        }
        return Math.floor(Math.random() * 25) + 50; // 50-75%
      };

      // Select 2 different characters and 1 same character
      const selectedDifferent = differentCharacterUsers
        .slice(0, 2)
        .map(u => ({
          user: {
            id: u.id,
            name: u.username,
            character: u.character!,
            matchPercentage: calculateMatchPercentage(u)
          },
          matchType: 'different' as const
        }));

      const selectedSame = sameCharacterUsers
        .slice(0, 1)
        .map(u => ({
          user: {
            id: u.id,
            name: u.username,
            character: u.character!,
            matchPercentage: calculateMatchPercentage(u)
          },
          matchType: 'same' as const
        }));

      setMatches([...selectedDifferent, ...selectedSame]);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.profileComplete) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Vibe</h1>
          <p className="text-muted-foreground">
            Discover connections based on our smart 2:1 matching algorithm
          </p>
        </div>

        {/* Algorithm Explanation */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-accent/20 p-3 rounded-full">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold">Smart Matching Algorithm</h3>
                <p className="text-sm text-muted-foreground">2:1 Ratio for Perfect Balance</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">2 Different Characters</h4>
                <p className="text-sm text-muted-foreground">
                  Discover fresh perspectives and learn from diverse personalities
                </p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-lg">
                <h4 className="font-medium mb-2">1 Same Character</h4>
                <p className="text-sm text-muted-foreground">
                  Connect with like-minded individuals who share your traits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Finding your perfect matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground">
                Try again later as more students join your college community!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <Card key={match.user.id} className="hover:shadow-lg transition-shadow" data-testid={`card-match-${index}`}>
                <CardContent className="p-6 text-center">
                  <CharacterAvatar 
                    character={match.user.character as CharacterTypeValue} 
                    size="lg" 
                    className="mx-auto mb-4"
                  />
                  
                  <h3 className="font-semibold mb-2" data-testid={`text-match-name-${index}`}>
                    {match.user.name}
                  </h3>
                  
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Badge variant={match.matchType === 'same' ? 'secondary' : 'default'}>
                      {CHARACTERS[match.user.character as CharacterTypeValue].name}
                    </Badge>
                    <Badge variant="outline">
                      {match.user.matchPercentage}% match
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {CHARACTERS[match.user.character as CharacterTypeValue].traits.join(' • ')}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button className="flex-1" size="sm" data-testid={`button-connect-${index}`}>
                      <Plus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-like-${index}`}>
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {match.matchType === 'same' && (
                    <div className="mt-3 text-xs text-secondary">
                      <span className="bg-secondary/20 px-2 py-1 rounded">Similar Mind</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Match History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Your Connections</CardTitle>
          </CardHeader>
          <CardContent>
            {user.connections && user.connections.length > 0 ? (
              <div className="space-y-3">
                {user.connections.slice(0, 3).map((connectionId, index) => (
                  <div key={connectionId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <span className="font-medium">Connected User</span>
                    </div>
                    <Button size="sm" variant="outline" data-testid={`button-message-${index}`}>
                      Message
                    </Button>
                  </div>
                ))}
                {user.connections.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{user.connections.length - 3} more connections
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🤝</div>
                <p className="text-muted-foreground">No connections yet</p>
                <p className="text-sm text-muted-foreground">Start connecting with your matches above!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="h-20 md:hidden" />
    </div>
  );
}
