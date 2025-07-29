'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, MessageCircle, Bell, User, Plus, Camera } from 'lucide-react'
import Header from '@/components/Header'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import CommentsModal from '@/components/CommentsModal'
import Stories from '@/components/Stories'
import Messaging from '@/components/Messaging'
import Explore from '@/components/Explore'
import MediaEditor from '@/components/MediaSharing/MediaEditor'
import { mockPosts } from '@/data/mockData'
import { Story, User as UserType, Chat, Message, MediaItem, Post, Location } from '@/types'

// Mock current user
const mockCurrentUser: UserType = {
  id: 'current-user',
  username: 'you',
  displayName: 'You',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Living my best life! 📸✨',
  verified: false,
  followers: 1234,
  following: 567,
  joinDate: new Date('2023-01-01'),
  email: 'you@example.com',
  mfaEnabled: true,
  backupMethods: ['totp'],
  isOnline: true,
  lastSeen: new Date(),
  privacySettings: {
    profileVisibility: 'public',
    storyVisibility: 'friends',
    messagePermissions: 'friends',
    locationSharing: false,
    onlineStatus: true,
    readReceipts: true,
    lastSeen: true
  }
}

// Mock stories
const mockStories: Story[] = [
  {
    id: '1',
    author: {
      id: '2',
      username: 'jane_doe',
      displayName: 'Jane Doe',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d1a8e4?w=150&h=150&fit=crop&crop=face',
      verified: true,
      followers: 5000,
      following: 500,
      joinDate: new Date('2022-06-15'),
      email: 'jane@example.com',
      mfaEnabled: false,
      backupMethods: [],
      isOnline: true,
      lastSeen: new Date(),
      privacySettings: {
        profileVisibility: 'public',
        storyVisibility: 'public',
        messagePermissions: 'everyone',
        locationSharing: true,
        onlineStatus: true,
        readReceipts: true,
        lastSeen: true
      }
    },
    media: {
      id: 'story-media-1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=700&fit=crop'
    },
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    expiresAt: new Date(Date.now() + 23 * 3600000), // 23 hours from now
    views: [],
    type: 'photo',
    privacy: 'public',
    stickers: []
  }
]

// Mock chats
const mockChats: Chat[] = [
  {
    id: '1',
    type: 'direct',
    participants: [
      mockCurrentUser,
      {
        id: '2',
        username: 'jane_doe',
        displayName: 'Jane Doe',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d1a8e4?w=150&h=150&fit=crop&crop=face',
        verified: true,
        followers: 5000,
        following: 500,
        joinDate: new Date('2022-06-15'),
        email: 'jane@example.com',
        mfaEnabled: false,
        backupMethods: [],
        isOnline: true,
        lastSeen: new Date(),
        privacySettings: {
          profileVisibility: 'public',
          storyVisibility: 'public',
          messagePermissions: 'everyone',
          locationSharing: true,
          onlineStatus: true,
          readReceipts: true,
          lastSeen: true
        }
      }
    ],
    createdBy: mockCurrentUser,
    createdAt: new Date('2024-01-01'),
    lastMessage: {
      id: '1',
      chatId: '1',
      sender: mockCurrentUser,
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      type: 'text',
      reactions: [],
      status: 'read'
    },
    unreadCount: 0,
    isArchived: false,
    isMuted: false,
    isPinned: false
  }
]

// Mock messages
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      chatId: '1',
      sender: mockCurrentUser,
      content: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 1800000),
      type: 'text',
      reactions: [],
      status: 'read'
    },
    {
      id: '2',
      chatId: '1',
      sender: mockChats[0].participants[1],
      content: 'I\'m doing great! Just finished a photography session. How about you?',
      timestamp: new Date(Date.now() - 1500000),
      type: 'text',
      reactions: [],
      status: 'read'
    }
  ]
}

export default function Home() {
  const [posts, setPosts] = useState(mockPosts)
  const [selectedPost, setSelectedPost] = useState<typeof mockPosts[0] | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'messages' | 'notifications' | 'profile'>('home')
  const [stories, setStories] = useState<Story[]>(mockStories)
  const [chats] = useState<Chat[]>(mockChats)
  const [messages] = useState<Record<string, Message[]>>(mockMessages)
  const [isMediaEditorOpen, setIsMediaEditorOpen] = useState(false)
  const [mediaToEdit, setMediaToEdit] = useState<MediaItem[]>([])

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ))
  }

  const handleShare = (postId: string) => {
    console.log('Shared post:', postId)
    // Implement sharing functionality
  }

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setSelectedPost(post)
      setIsCommentsModalOpen(true)
    }
  }

  const handleCommunityNoteVote = (noteId: string, voteType: 'helpful' | 'notHelpful') => {
    console.log('Voted on community note:', noteId, voteType)
    // Implement community note voting
  }

  const handleStoryView = (storyId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? {
            ...story,
            views: [...story.views, { user: mockCurrentUser, timestamp: new Date() }]
          }
        : story
    ))
  }

  const handleStoryCreate = (story: Omit<Story, 'id' | 'timestamp' | 'expiresAt' | 'views'>) => {
    const newStory: Story = {
      ...story,
      id: Date.now().toString(),
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 3600000), // 24 hours from now
      views: []
    }
    setStories(prev => [newStory, ...prev])
  }

  const handlePostClick = (post: Post) => {
    setSelectedPost(post)
    setIsCommentsModalOpen(true)
  }

  const handleUserClick = (user: UserType) => {
    console.log('User clicked:', user.username)
    // Navigate to user profile
  }

  const handleHashtagClick = (hashtag: string) => {
    console.log('Hashtag clicked:', hashtag)
    // Navigate to hashtag page or filter posts
  }

  const handleLocationClick = (location: Location) => {
    console.log('Location clicked:', location.name)
    // Navigate to location page
  }

  const handleMediaEdit = (media: MediaItem[]) => {
    setMediaToEdit(media)
    setIsMediaEditorOpen(true)
  }

  const handleMediaSave = (editedMedia: MediaItem[]) => {
    console.log('Media saved:', editedMedia)
    // Handle saving edited media
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="max-w-2xl mx-auto">
            {/* Stories */}
            <Stories
              stories={stories}
              currentUser={mockCurrentUser}
              onStoryView={handleStoryView}
              onStoryCreate={handleStoryCreate}
            />
            
            {/* Create Post */}
            <CreatePost />
            
            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onShare={handleShare}
                  onComment={handleComment}
                  onCommunityNoteVote={handleCommunityNoteVote}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center py-8">
              <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Load more posts
              </button>
            </div>
          </div>
        )

      case 'explore':
        return (
          <Explore
            currentUser={mockCurrentUser}
            onPostClick={handlePostClick}
            onUserClick={handleUserClick}
            onHashtagClick={handleHashtagClick}
            onLocationClick={handleLocationClick}
          />
        )

      case 'messages':
        return (
          <Messaging
            currentUser={mockCurrentUser}
            initialChats={chats}
            initialMessages={messages}
          />
        )

      case 'notifications':
        return (
          <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Notifications
            </h2>
            <p className="text-gray-600">
              Stay updated with likes, comments, and mentions.
            </p>
          </div>
        )

      case 'profile':
        return (
          <div className="max-w-2xl mx-auto p-8 text-center">
            <img
              src={mockCurrentUser.avatar}
              alt={mockCurrentUser.displayName}
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {mockCurrentUser.displayName}
            </h2>
            <p className="text-gray-600 mb-4">@{mockCurrentUser.username}</p>
            <p className="text-gray-700 mb-6">{mockCurrentUser.bio}</p>
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="font-semibold text-lg">{mockCurrentUser.followers}</div>
                <div className="text-gray-600 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{mockCurrentUser.following}</div>
                <div className="text-gray-600 text-sm">Following</div>
              </div>
            </div>
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Edit Profile
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header />
      </div>
      
      <main className="lg:max-w-7xl lg:mx-auto lg:px-4 lg:sm:px-6 lg:lg:px-8 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className={`flex-1 ${activeTab === 'messages' ? '' : 'lg:mx-0'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar - Hidden on mobile and when messages is active */}
          {activeTab !== 'messages' && (
            <div className="hidden lg:block">
              <Sidebar />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'home' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'explore' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Search className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Explore</span>
          </button>
          <button
            onClick={() => {/* Handle create post */}}
            className="flex-1 py-3 px-4 text-center text-gray-600"
          >
            <Plus className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Create</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'messages' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <MessageCircle className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Messages</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <User className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          post={selectedPost}
          isOpen={isCommentsModalOpen}
          onClose={() => {
            setIsCommentsModalOpen(false)
            setSelectedPost(null)
          }}
        />
      )}

      {/* Media Editor Modal */}
      <AnimatePresence>
        {isMediaEditorOpen && (
          <MediaEditor
            media={mediaToEdit}
            isOpen={isMediaEditorOpen}
            onClose={() => setIsMediaEditorOpen(false)}
            onSave={handleMediaSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
