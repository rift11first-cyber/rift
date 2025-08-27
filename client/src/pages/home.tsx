import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { CreatePost } from '@/components/create-post';
import { PostCard } from '@/components/post-card';
import { CharacterAvatar } from '@/components/character-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post, CHARACTERS } from '@shared/schema';
import { Search, Plus, VenetianMask } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(Post & { userData?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    if (!user) return;

    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      const postsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const post = { id: docSnapshot.id, ...docSnapshot.data() } as Post;
          
          // Fetch user data for non-anonymous posts
          if (!post.isAnonymous && post.userId !== 'anonymous') {
            try {
              const userDoc = await getDoc(doc(db, 'users', post.userId));
              if (userDoc.exists()) {
                (post as any).userData = userDoc.data();
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }
          
          return post;
        })
      );
      
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user?.profileComplete) {
    return null; // Will be handled by App.tsx routing
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar */}
          <aside className="lg:w-80 space-y-6">
            {/* Character Profile Card */}
            <Card className="character-glow">
              <CardContent className="p-6 text-center">
                {user.character && (
                  <>
                    <CharacterAvatar 
                      character={user.character} 
                      size="xl" 
                      showGlow 
                      className="mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold mb-2">
                      {CHARACTERS[user.character].name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {CHARACTERS[user.character].traits.join(' • ')}
                    </p>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Character Compatibility</p>
                      <div className="flex justify-between text-sm">
                        <span>High Match</span>
                        <span className="text-accent font-medium">92%</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" data-testid="button-find-vibe">
                  <Search className="h-4 w-4 mr-2" />
                  Find Your Vibe
                </Button>
                <Button variant="secondary" className="w-full justify-start" data-testid="button-anonymous">
                  <VenetianMask className="h-4 w-4 mr-2" />
                  Anonymous Post
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-offline-meet">
                  <Plus className="h-4 w-4 mr-2" />
                  Offline Meet
                </Button>
              </CardContent>
            </Card>

            {/* College Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{user.college} Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Students</span>
                  <span className="font-medium" data-testid="text-active-students">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts Today</span>
                  <span className="font-medium" data-testid="text-posts-today">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Connections</span>
                  <span className="font-medium" data-testid="text-connections">{user.connections?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Feed */}
          <main className="flex-1 space-y-6">
            <CreatePost />
            
            {loading ? (
              // Loading skeletons
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to share something with your college community!
                  </p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:w-80 space-y-6">
            {/* Character Matching Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base">Find Your Vibe</CardTitle>
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">2:1 Match</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Discover connections based on your {user.character ? CHARACTERS[user.character].name : ''} character
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                    <CharacterAvatar character="explorer" size="sm" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Ananya Singh</p>
                      <p className="text-xs text-muted-foreground">Explorer • 92% match</p>
                    </div>
                    <Button size="sm" variant="ghost" data-testid="button-connect-user-1">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                    <CharacterAvatar character="maverick" size="sm" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Rohit Kumar</p>
                      <p className="text-xs text-muted-foreground">Maverick • 78% match</p>
                    </div>
                    <Button size="sm" variant="ghost" data-testid="button-connect-user-2">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <Button className="w-full" data-testid="button-view-all-matches">
                  View All Matches
                </Button>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trending in {user.college}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="cursor-pointer hover:bg-muted p-2 rounded transition-colors" data-testid="button-trending-1">
                  <p className="font-medium text-sm">#PlacementSeason</p>
                  <p className="text-xs text-muted-foreground">234 posts</p>
                </div>
                <div className="cursor-pointer hover:bg-muted p-2 rounded transition-colors" data-testid="button-trending-2">
                  <p className="font-medium text-sm">#TechFest2024</p>
                  <p className="text-xs text-muted-foreground">189 posts</p>
                </div>
                <div className="cursor-pointer hover:bg-muted p-2 rounded transition-colors" data-testid="button-trending-3">
                  <p className="font-medium text-sm">#StudyGroup</p>
                  <p className="text-xs text-muted-foreground">156 posts</p>
                </div>
              </CardContent>
            </Card>

            {/* Anonymous Corner Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base">Anonymous Corner</CardTitle>
                <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded">Safe Space</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      "Honestly struggling with imposter syndrome in my CS courses..."
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>23 supports</span>
                      <span>•</span>
                      <span>2h ago</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      "Anyone else feel like everyone has it figured out except them?"
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>67 supports</span>
                      <span>•</span>
                      <span>5h ago</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="secondary" className="w-full" data-testid="button-share-anonymous">
                  Share Anonymously
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Add padding for mobile navigation */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
