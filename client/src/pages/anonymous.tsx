import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Shield, Lock, MessageSquare } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const rantPhrases = [
  "I'm so tired of people not understanding me",
  "Why is college so overwhelming?",
  "I hate feeling like I'm not good enough",
  "Everyone seems to have it figured out except me",
  "I'm exhausted from pretending everything is fine",
  "Why do I feel so lonely even when surrounded by people?",
  "I'm stressed about my future and don't know what to do",
  "I feel like I'm failing at everything",
  "Why is making friends so hard?",
  "I'm tired of comparing myself to others",
  "Academic pressure is crushing me",
  "I feel like nobody really knows the real me"
];

interface AnonymousPost {
  id: string;
  content: string;
  postType: 'confess' | 'rant';
  likes: string[];
  createdAt: Date;
}

export default function AnonymousPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('anonymous');
  const [postType, setPostType] = useState<'confess' | 'rant'>('confess');
  const [selectedPhrase, setSelectedPhrase] = useState('');

  useEffect(() => {
    if (!user) return;

    // Query for anonymous posts from the separate collection
    const postsQuery = query(
      collection(db, 'anonymousPosts'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as AnonymousPost[];
      
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async () => {
    const content = postType === 'confess' ? newPost.trim() : selectedPhrase;
    if (!content || !user) return;

    setSubmitting(true);
    try {
      // Store in the separate anonymousPosts collection
      await addDoc(collection(db, 'anonymousPosts'), {
        content: content,
        postType: postType,
        likes: [],
        createdAt: serverTimestamp(),
      });

      setNewPost('');
      setSelectedPhrase('');
      toast({
        title: `Anonymous ${postType} shared!`,
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
      const postRef = doc(db, 'anonymousPosts', postId);
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

  const canSubmit = postType === 'confess' ? newPost.trim() : selectedPhrase;

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
              <h1 className="text-3xl font-bold">Unfiltered Corner</h1>
              <p className="text-muted-foreground">
                A safe space to confess or rant anonymously
              </p>
            </div>
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
              Choose to confess something personal or rant about what's bothering you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Post Type Selection */}
            <div className="flex space-x-2">
              <Button
                variant={postType === 'confess' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPostType('confess');
                  setSelectedPhrase('');
                }}
                className="flex items-center space-x-2"
                data-testid="button-confess-type"
              >
                <Lock className="h-4 w-4" />
                <span>Confess</span>
              </Button>
              <Button
                variant={postType === 'rant' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPostType('rant');
                  setNewPost('');
                }}
                className="flex items-center space-x-2"
                data-testid="button-rant-type"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Rant</span>
              </Button>
            </div>

            {/* Confession Input */}
            {postType === 'confess' && (
              <Textarea
                placeholder="What would you like to confess? Share your thoughts anonymously..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
                data-testid="input-confession-text"
              />
            )}

            {/* Rant Phrase Selection */}
            {postType === 'rant' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Select a phrase that resonates with how you're feeling:
                </p>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {rantPhrases.map((phrase, index) => (
                    <Button
                      key={index}
                      variant={selectedPhrase === phrase ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPhrase(phrase)}
                      className="justify-start text-left h-auto py-3 px-4 whitespace-normal"
                      data-testid={`button-rant-phrase-${index}`}
                    >
                      {phrase}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {postType === 'confess' 
                  ? `${newPost.length}/500 characters • Completely anonymous`
                  : 'Select a phrase • Completely anonymous'
                }
              </p>
              <Button 
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                data-testid="button-submit-anonymous"
              >
                {submitting ? 'Sharing...' : `Share ${postType === 'confess' ? 'Confession' : 'Rant'}`}
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
                  Be the first to share a confession or rant in this safe space
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`card-anonymous-${post.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl">
                      {post.postType === 'confess' ? '🤫' : '😤'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="font-semibold">Anonymous</span>
                        <Badge variant={post.postType === 'confess' ? 'secondary' : 'destructive'}>
                          {post.postType === 'confess' ? 'Confession' : 'Rant'}
                        </Badge>
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
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="h-20 md:hidden" />
    </div>
  );
}