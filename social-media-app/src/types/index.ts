export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  verified: boolean;
  followers: number;
  following: number;
  joinDate: Date;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  media: MediaItem[];
  timestamp: Date;
  likes: number;
  shares: number;
  comments: number;
  isLiked: boolean;
  isShared: boolean;
  communityNotes: CommunityNote[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  parentId?: string;
}

export interface CommunityNote {
  id: string;
  postId: string;
  content: string;
  author: User;
  timestamp: Date;
  votes: {
    helpful: number;
    notHelpful: number;
  };
  userVote?: 'helpful' | 'notHelpful' | null;
  status: 'pending' | 'approved' | 'rejected';
  sources?: string[];
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'share' | 'follow' | 'community_note';
  user: User;
  post?: Post;
  timestamp: Date;
  read: boolean;
}