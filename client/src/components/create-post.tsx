import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { CharacterAvatar } from './character-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Image, BarChart3, VenetianMask } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InsertPost } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const newPost: InsertPost = {
        userId: isAnonymous ? 'anonymous' : user.id,
        content: content.trim(),
        isAnonymous,
        isPoll: false,
      };

      await addDoc(collection(db, 'posts'), {
        ...newPost,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
      });

      setContent('');
      setIsAnonymous(false);
      
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community.",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {isAnonymous ? (
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl">
              👤
            </div>
          ) : user.character ? (
            <CharacterAvatar character={user.character} size="md" />
          ) : (
            <div className="w-12 h-12 bg-muted rounded-full" />
          )}
          
          <div className="flex-1">
            <Textarea
              placeholder="What's happening in your college?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 bg-muted focus:bg-background transition-colors"
              data-testid="input-post-content"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-4 text-muted-foreground">
            <Button variant="ghost" size="sm" data-testid="button-add-image">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-add-poll">
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={isAnonymous ? 'text-secondary' : ''}
              data-testid="button-toggle-anonymous"
            >
              <VenetianMask className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            data-testid="button-submit-post"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
