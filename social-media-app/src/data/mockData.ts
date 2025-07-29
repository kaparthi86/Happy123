import { User, Post, Comment, CommunityNote } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    displayName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Tech enthusiast and coffee lover ☕',
    verified: true,
    followers: 12500,
    following: 890,
    joinDate: new Date('2022-01-15')
  },
  {
    id: '2',
    username: 'sarahchen',
    displayName: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    bio: 'Designer & photographer 📸',
    verified: false,
    followers: 8900,
    following: 1200,
    joinDate: new Date('2021-08-22')
  },
  {
    id: '3',
    username: 'alexsmith',
    displayName: 'Alex Smith',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Software engineer at @TechCorp',
    verified: true,
    followers: 15600,
    following: 650,
    joinDate: new Date('2020-11-10')
  }
];

export const mockCommunityNotes: CommunityNote[] = [
  {
    id: 'cn1',
    postId: '1',
    content: 'This claim has been fact-checked. According to recent studies, the actual percentage is closer to 85%, not 90% as stated.',
    author: mockUsers[2],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    votes: {
      helpful: 245,
      notHelpful: 23
    },
    userVote: null,
    status: 'approved',
    sources: ['https://example.com/study1', 'https://example.com/research2']
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    content: 'Just launched my new project! 🚀 After months of hard work, I\'m excited to share this with the community. What do you think?',
    media: [
      {
        id: 'm1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
        alt: 'Project screenshot'
      }
    ],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    likes: 234,
    shares: 45,
    comments: 67,
    isLiked: true,
    isShared: false,
    communityNotes: [mockCommunityNotes[0]]
  },
  {
    id: '2',
    author: mockUsers[1],
    content: 'Beautiful sunset from my evening walk 🌅 Nature never fails to amaze me!',
    media: [
      {
        id: 'm2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        alt: 'Sunset landscape'
      }
    ],
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 189,
    shares: 23,
    comments: 34,
    isLiked: false,
    isShared: true,
    communityNotes: []
  },
  {
    id: '3',
    author: mockUsers[2],
    content: 'Interesting discussion about the future of AI and its impact on software development. What are your thoughts on this? 🤖',
    media: [],
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
    likes: 567,
    shares: 123,
    comments: 89,
    isLiked: true,
    isShared: false,
    communityNotes: []
  },
  {
    id: '4',
    author: mockUsers[1],
    content: 'Quick demo of the new animation I\'ve been working on! Feedback welcome 💫',
    media: [
      {
        id: 'm3',
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
        alt: 'Animation demo video'
      }
    ],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: 445,
    shares: 78,
    comments: 56,
    isLiked: false,
    isShared: false,
    communityNotes: []
  }
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    author: mockUsers[1],
    content: 'This looks amazing! Great work 👏',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: 'c1r1',
        author: mockUsers[0],
        content: 'Thank you so much! 🙏',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        likes: 5,
        isLiked: true,
        replies: [],
        parentId: 'c1'
      }
    ]
  },
  {
    id: 'c2',
    author: mockUsers[2],
    content: 'Would love to see the technical details behind this implementation.',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    likes: 8,
    isLiked: true,
    replies: []
  }
];

export const currentUser: User = mockUsers[0];