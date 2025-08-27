import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { CharacterAvatar } from "@/components/character-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post, CHARACTERS } from "@shared/schema";
import { Search, Plus, VenetianMask, Users, MessageSquare } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<(Post & { userData?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    if (!user) return;

    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      const postsData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const post = { id: docSnapshot.id, ...docSnapshot.data() } as Post;

          // Fetch user data for non-anonymous posts
          if (!post.isAnonymous && post.userId !== "anonymous") {
            try {
              const userDoc = await getDoc(doc(db, "users", post.userId));
              if (userDoc.exists()) {
                (post as any).userData = userDoc.data();
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }

          return post;
        })
      );

      // Filter out anonymous posts from the main feed
      const nonAnonymousPosts = postsData.filter(
        (post) => !post.isAnonymous && post.userId !== "anonymous"
      );

      setPosts(nonAnonymousPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user?.profileComplete) {
    return null; // Will be handled by App.tsx routing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Left Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Character Profile Card */}
            <Card className="character-glow border-2 border-primary/20 shadow-lg">
              <CardContent className="p-6 text-center">
                {user.character && (
                  <>
                    <div className="relative">
                      <CharacterAvatar
                        character={user.character}
                        size="xl"
                        showGlow
                        className="mx-auto mb-4"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {CHARACTERS[user.character].name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {CHARACTERS[user.character].traits.join(" • ")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-2 border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
                  data-testid="button-find-vibe"
                >
                  <Search className="h-4 w-4 mr-3" />
                  Find Your Vibe
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start h-12 shadow-md hover:shadow-lg transition-all"
                  data-testid="button-anonymous"
                >
                  <VenetianMask className="h-4 w-4 mr-3" />
                  Anonymous Post
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-2 hover:bg-muted/50"
                  data-testid="button-offline-meet"
                >
                  <Users className="h-4 w-4 mr-3" />
                  Offline Meet
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Feed */}
          <main className="col-span-1 lg:col-span-6 space-y-4 lg:space-y-6">
            {/* Mobile Character Card - Only shown on mobile */}
            <div className="lg:hidden">
              <Card className="character-glow border-2 border-primary/20 shadow-lg">
                <CardContent className="p-4">
                  {user.character && (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <CharacterAvatar
                          character={user.character}
                          size="lg"
                          showGlow
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {CHARACTERS[user.character].name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          92% compatibility
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mobile Quick Actions - Only shown on mobile */}
            <div className="lg:hidden">
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      size="sm"
                      className="flex-col h-16 bg-gradient-to-b from-primary to-primary/80"
                      data-testid="button-find-vibe-mobile"
                    >
                      <Search className="h-4 w-4 mb-1" />
                      <span className="text-xs">Find Vibe</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-col h-16"
                      data-testid="button-anonymous-mobile"
                    >
                      <VenetianMask className="h-4 w-4 mb-1" />
                      <span className="text-xs">Anonymous</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-col h-16"
                      data-testid="button-offline-meet-mobile"
                    >
                      <Users className="h-4 w-4 mb-1" />
                      <span className="text-xs">Meet Up</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <CreatePost />

            {loading ? (
              // Loading skeletons
              <div className="space-y-4 lg:space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shadow-lg">
                    <CardContent className="p-4 lg:p-6">
                      <div className="flex items-start space-x-3 lg:space-x-4">
                        <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2 min-w-0">
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
              <Card className="shadow-lg border-2 border-dashed border-muted-foreground/30">
                <CardContent className="p-8 lg:p-12 text-center">
                  <div className="text-4xl lg:text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Be the first to share something with your college community!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Character Matching Preview */}
            <Card className="shadow-lg border-2 border-border/50 hover:border-accent/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-accent" />
                  Find Your Vibe
                </CardTitle>
                <span className="text-xs bg-gradient-to-r from-accent/20 to-primary/20 text-accent px-3 py-1 rounded-full font-medium border border-accent/30">
                  2:1 Match
                </span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Someone in your community might match your vibe based on your{" "}
                  {user.character ? CHARACTERS[user.character].name : ""}{" "}
                  character.
                </p>

                <a
                  href="/find-vibe"
                  className="block w-full text-center bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white py-2 rounded-lg shadow-md transition-all"
                  data-testid="link-view-all-matches"
                >
                  View All Matches
                </a>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Add padding for mobile navigation */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
