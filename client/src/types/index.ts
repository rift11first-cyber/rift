export interface MatchResult {
  user: {
    id: string;
    name: string;
    character: string;
    matchPercentage: number;
  };
  matchType: 'different' | 'same';
}

export interface TrendingTopic {
  hashtag: string;
  postCount: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'match' | 'system';
  message: string;
  read: boolean;
  createdAt: Date;
}
