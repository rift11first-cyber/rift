import { useState } from 'react';
import { Post, CHARACTERS } from '@shared/schema';
import { CharacterAvatar } from './character-avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share, Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post & { 
    userData?: { username: string; character?: string } 
  };
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(user ? post.likes.includes(user.id) : false);
  const [likesCount, setLikesCount] = useState(post.likes.length);

  const handleLike = async () => {
    if (!user) return;

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        likes: newIsLiked ? arrayUnion(user.id) : arrayRemove(user.id)
      });
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setIsLiked(!newIsLiked);
      setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
    }
  };

  // Safe timestamp conversion with fallback
  const getTimeAgo = () => {
    try {
      if (!post.createdAt) {
        return 'Just now';
      }
      
      // Handle Firebase Timestamp objects
      const date = post.createdAt.toDate ? post.createdAt.toDate() : new Date(post.createdAt);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Just now';
    }
  };

  const timeAgo = getTimeAgo();

  return (
    <Card className="feed-card" data-testid={`card-post-${post.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {post.isAnonymous ? (
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl">
              👤
            </div>
          ) : post.userData?.character ? (
            <CharacterAvatar character={post.userData.character as any} size="md" />
          ) : (
            <div className="w-12 h-12 bg-muted rounded-full" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {post.isAnonymous ? (
                <>
                  <span className="font-semibold" data-testid="text-author-anonymous">Anonymous</span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="bg-secondary/20 text-secondary px-2 py-1 rounded text-xs">
                    Anonymous Corner
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold" data-testid={`text-author-${post.id}`}>
                    {(post.userData as any)?.fullName || post.userData?.username || 'Unknown User'}
                  </span>
                  {post.userData?.character && (
                    <>
                      <span className="text-muted-foreground text-sm">•</span>
                      <span className="text-muted-foreground text-sm" data-testid={`text-character-${post.id}`}>
                        {CHARACTERS[post.userData.character as keyof typeof CHARACTERS]?.name}
                      </span>
                    </>
                  )}
                </>
              )}
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm" data-testid={`text-timestamp-${post.id}`}>
                {timeAgo}
              </span>
            </div>
            
            <p className="text-foreground mb-4" data-testid={`text-content-${post.id}`}>
              {post.content}
            </p>

            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="Post content"
                className="rounded-lg w-full h-64 object-cover mb-4"
                data-testid={`img-post-${post.id}`}
              />
            )}

            {post.isPoll && post.pollOptions && (
              <div className="bg-muted rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">📊 Poll</h4>
                <div className="space-y-2">
                  {post.pollOptions.map((option, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-background rounded cursor-pointer hover:bg-primary/10"
                      data-testid={`button-poll-option-${post.id}-${index}`}
                    >
                      <span className="text-sm">{option.text}</span>
                      <span className="text-xs text-muted-foreground">{option.votes} votes</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                  data-testid={`button-like-${post.id}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likesCount}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                  data-testid={`button-comment-${post.id}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments.length}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
                  data-testid={`button-share-${post.id}`}
                >
                  <Share className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                data-testid={`button-bookmark-${post.id}`}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}