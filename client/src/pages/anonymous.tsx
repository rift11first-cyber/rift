import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Shield } from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AnonymousPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('anonymous');

  useEffect(() => {
    if (!user) return;

    // Query for anonymous posts only
    const postsQuery = query(
      collection(db, 'posts'),
      where('isAnonymous', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Post[];
      
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async () => {
    if (!newPost.trim() || !user) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: 'anonymous',
        content: newPost.trim(),
        isAnonymous: true,
        isPoll: false,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
      });

      setNewPost('');
      toast({
        title: "Anonymous post shared!",
        description: "Your message has been posted safely and anonymously.",
      });
    } catch (error) {
      console.error('Error creating anonymous post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupport = async (postId: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      const isSupporting = post?.likes.includes(user.id);

      await updateDoc(postRef, {
        likes: isSupporting ? arrayRemove(user.id) : arrayUnion(user.id)
      });
    } catch (error) {
      console.error('Error updating support:', error);
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
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-secondary/20 p-3 rounded-full">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Anonymous Corner</h1>
              <p className="text-muted-foreground">
                A safe space to share thoughts and feelings anonymously
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h3 className="font-semibold text-sm">Completely Anonymous</h3>
                <p className="text-xs text-muted-foreground">Your identity is never revealed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">💙</div>
                <h3 className="font-semibold text-sm">Safe Space</h3>
                <p className="text-xs text-muted-foreground">Share without judgment</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🤝</div>
                <h3 className="font-semibold text-sm">Community Support</h3>
                <p className="text-xs text-muted-foreground">Get help from peers</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Anonymous Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Share Anonymously</span>
              <Badge variant="secondary">Safe Space</Badge>
            </CardTitle>
            <CardDescription>
              Express your thoughts, concerns, or feelings without revealing your identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind? Share your thoughts anonymously..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
              data-testid="input-anonymous-post"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {newPost.length}/500 characters • Completely anonymous
              </p>
              <Button 
                onClick={handleSubmit}
                disabled={!newPost.trim() || submitting}
                data-testid="button-submit-anonymous"
              >
                {submitting ? 'Sharing...' : 'Share Anonymously'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Anonymous Posts Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-secondary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading anonymous posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-lg font-semibold mb-2">No anonymous posts yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share something in this safe space
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`card-anonymous-${post.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="font-semibold">Anonymous</span>
                        <Badge variant="secondary">Anonymous Corner</Badge>
                        <span className="text-muted-foreground text-sm">•</span>
                        <span className="text-muted-foreground text-sm">
                          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-foreground mb-4 leading-relaxed" data-testid={`text-anonymous-content-${post.id}`}>
                        {post.content}
                      </p>
                      
                      <div className="flex items-center space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSupport(post.id)}
                          className={`flex items-center space-x-2 ${
                            user && post.likes.includes(user.id) 
                              ? 'text-secondary' 
                              : 'text-muted-foreground'
                          } hover:text-secondary`}
                          data-testid={`button-support-${post.id}`}
                        >
                          <Heart className={`h-4 w-4 ${
                            user && post.likes.includes(user.id) ? 'fill-current' : ''
                          }`} />
                          <span className="text-sm">{post.likes.length} supports</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                          data-testid={`button-respond-${post.id}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">Respond</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Support Resources */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-blue-600" />
              <span>Need Support?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Remember, you're not alone. If you're struggling with mental health or need someone to talk to:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-sm mb-1">Campus Counseling</h4>
                <p className="text-xs text-muted-foreground">Contact your college counseling center</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-sm mb-1">Crisis Helpline</h4>
                <p className="text-xs text-muted-foreground">24/7 support: 1-800-XXX-XXXX</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="h-20 md:hidden" />
    </div>
  );
}
