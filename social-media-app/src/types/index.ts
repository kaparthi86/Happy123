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
  email: string;
  mfaEnabled: boolean;
  totpSecret?: string;
  phoneNumber?: string;
  recoveryCodes?: string[];
  backupMethods: ('totp' | 'sms' | 'recovery')[];
  // Enhanced features
  location?: string;
  website?: string;
  birthDate?: Date;
  isOnline: boolean;
  lastSeen: Date;
  privacySettings: PrivacySettings;
  businessAccount?: BusinessAccount;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  storyVisibility: 'public' | 'friends' | 'close_friends' | 'private';
  messagePermissions: 'everyone' | 'friends' | 'no_one';
  locationSharing: boolean;
  onlineStatus: boolean;
  readReceipts: boolean;
  lastSeen: boolean;
}

export interface BusinessAccount {
  category: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  hours?: BusinessHours[];
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  mfaEnabled: boolean;
  mfaSetupRequired: boolean;
  backupMethods: ('totp' | 'sms' | 'recovery')[];
  isOnline: boolean;
  lastSeen: Date;
}

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  mfaSetupRequired: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface MFAVerification {
  code: string;
  method: 'totp' | 'sms' | 'recovery';
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'gif';
  url: string;
  thumbnail?: string;
  alt?: string;
  duration?: number; // for videos/audio
  filters?: string[]; // Instagram-style filters
  aspectRatio?: number;
  size?: { width: number; height: number };
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
  // Enhanced features
  type: 'post' | 'story' | 'reel' | 'live';
  location?: Location;
  tags: User[]; // tagged users
  hashtags: string[];
  mentions: User[];
  privacy: 'public' | 'friends' | 'close_friends' | 'private';
  scheduledFor?: Date;
  expiresAt?: Date; // for stories
  isLive?: boolean;
  liveViewers?: number;
  reactions: Reaction[];
  isPinned?: boolean;
  isPromoted?: boolean;
  groupId?: string;
  pageId?: string;
}

export interface Story {
  id: string;
  author: User;
  media: MediaItem;
  timestamp: Date;
  expiresAt: Date;
  views: StoryView[];
  type: 'photo' | 'video' | 'text';
  text?: string;
  backgroundColor?: string;
  stickers?: Sticker[];
  music?: Music;
  location?: Location;
  privacy: 'public' | 'friends' | 'close_friends' | 'private';
  isHighlight?: boolean;
  highlightId?: string;
}

export interface StoryView {
  user: User;
  timestamp: Date;
}

export interface Sticker {
  id: string;
  type: 'emoji' | 'gif' | 'poll' | 'question' | 'quiz' | 'countdown' | 'mention' | 'hashtag' | 'location';
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  data: any; // specific data for each sticker type
}

export interface Music {
  id: string;
  title: string;
  artist: string;
  url: string;
  startTime: number;
  duration: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category?: string;
}

export interface Reaction {
  id: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry' | 'care';
  user: User;
  timestamp: Date;
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
  media?: MediaItem[];
  mentions: User[];
  reactions: Reaction[];
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
  type: 'like' | 'comment' | 'share' | 'follow' | 'community_note' | 'message' | 'story_view' | 'mention' | 'tag' | 'live' | 'event' | 'group_invite' | 'friend_request';
  user: User;
  post?: Post;
  story?: Story;
  message?: Message;
  group?: Group;
  event?: Event;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Messaging System (WhatsApp-inspired)
export interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  name?: string; // for group chats
  avatar?: string; // for group chats
  description?: string; // for group chats
  admins?: User[]; // for group chats
  createdBy: User;
  createdAt: Date;
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  disappearingMessages?: {
    enabled: boolean;
    duration: number; // in seconds
  };
}

export interface Message {
  id: string;
  chatId: string;
  sender: User;
  content?: string;
  media?: MediaItem[];
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact' | 'poll' | 'payment';
  replyTo?: Message;
  isForwarded?: boolean;
  forwardedFrom?: User;
  reactions: MessageReaction[];
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited?: boolean;
  editedAt?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  expiresAt?: Date; // for disappearing messages
}

export interface MessageReaction {
  emoji: string;
  user: User;
  timestamp: Date;
}

export interface VoiceCall {
  id: string;
  participants: User[];
  type: 'voice' | 'video';
  status: 'ringing' | 'active' | 'ended' | 'missed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isGroupCall: boolean;
}

// Groups and Pages (Facebook-inspired)
export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage?: string;
  privacy: 'public' | 'private' | 'secret';
  members: GroupMember[];
  admins: User[];
  moderators: User[];
  createdBy: User;
  createdAt: Date;
  rules?: string[];
  tags: string[];
  location?: Location;
  posts: Post[];
  events: Event[];
  memberRequests: GroupJoinRequest[];
}

export interface GroupMember {
  user: User;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  invitedBy?: User;
}

export interface GroupJoinRequest {
  id: string;
  user: User;
  message?: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Page {
  id: string;
  name: string;
  username: string;
  description: string;
  avatar: string;
  coverImage?: string;
  category: string;
  followers: number;
  likes: number;
  verified: boolean;
  owner: User;
  admins: User[];
  createdAt: Date;
  contactInfo: BusinessAccount;
  posts: Post[];
  events: Event[];
  products: Product[];
  reviews: Review[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  startTime: Date;
  endTime?: Date;
  location?: Location;
  isOnline: boolean;
  onlineLink?: string;
  organizer: User | Page;
  attendees: EventAttendee[];
  privacy: 'public' | 'friends' | 'private';
  category: string;
  ticketPrice?: number;
  maxAttendees?: number;
}

export interface EventAttendee {
  user: User;
  status: 'going' | 'interested' | 'not_going';
  timestamp: Date;
}

// Marketplace (Facebook-inspired)
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: MediaItem[];
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  seller: User;
  location: Location;
  isAvailable: boolean;
  createdAt: Date;
  views: number;
  savedBy: User[];
  tags: string[];
  shipping?: {
    available: boolean;
    cost?: number;
    methods: string[];
  };
}

export interface Review {
  id: string;
  reviewer: User;
  rating: number; // 1-5
  comment?: string;
  timestamp: Date;
  helpful: number;
  reportCount: number;
}

// Live Streaming
export interface LiveStream {
  id: string;
  streamer: User;
  title: string;
  description?: string;
  thumbnail?: string;
  viewers: User[];
  maxViewers: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  streamUrl: string;
  chatMessages: LiveChatMessage[];
  category: string;
  tags: string[];
  isPrivate: boolean;
  allowedViewers?: User[]; // for private streams
}

export interface LiveChatMessage {
  id: string;
  user: User;
  message: string;
  timestamp: Date;
  isHighlighted?: boolean;
  reactions: string[];
}

// Discovery and Explore
export interface TrendingTopic {
  id: string;
  hashtag: string;
  postCount: number;
  category: string;
  location?: string;
  isPromoted?: boolean;
}

export interface Suggestion {
  id: string;
  type: 'user' | 'page' | 'group' | 'hashtag' | 'location';
  data: User | Page | Group | string | Location;
  reason: string;
  score: number;
}

// Snapchat-inspired location features
export interface SnapMap {
  id: string;
  user: User;
  location: Location;
  timestamp: Date;
  isVisible: boolean;
  mood?: string;
  activity?: string;
  expiresAt: Date;
}

export interface LocationStory {
  id: string;
  location: Location;
  stories: Story[];
  contributors: User[];
  isPublic: boolean;
}