'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  TrendingUp, 
  MapPin, 
  Users, 
  Hash, 
  Play,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal
} from 'lucide-react'
import { Post, User, TrendingTopic, Suggestion, Location } from '@/types'
import { useInView } from 'react-intersection-observer'

interface ExploreProps {
  currentUser: User
  onPostClick: (post: Post) => void
  onUserClick: (user: User) => void
  onHashtagClick: (hashtag: string) => void
  onLocationClick: (location: Location) => void
}

interface ExplorePost extends Post {
  viewCount?: number
  isVideo?: boolean
}

const mockTrendingTopics: TrendingTopic[] = [
  { id: '1', hashtag: 'photography', postCount: 15420, category: 'Arts', isPromoted: false },
  { id: '2', hashtag: 'travel', postCount: 28900, category: 'Lifestyle', isPromoted: true },
  { id: '3', hashtag: 'food', postCount: 45600, category: 'Food', isPromoted: false },
  { id: '4', hashtag: 'fitness', postCount: 12300, category: 'Health', isPromoted: false },
  { id: '5', hashtag: 'art', postCount: 34500, category: 'Arts', isPromoted: false }
]

const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    type: 'user',
    data: {
      id: '1',
      username: 'jane_photographer',
      displayName: 'Jane Smith',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2d1a8e4?w=150&h=150&fit=crop&crop=face',
      verified: true
    } as User,
    reason: 'Popular in Photography',
    score: 95
  },
  {
    id: '2',
    type: 'hashtag',
    data: '#streetart',
    reason: 'Trending in your area',
    score: 88
  }
]

const PostGrid: React.FC<{
  posts: ExplorePost[]
  onPostClick: (post: Post) => void
}> = ({ posts, onPostClick }) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post, index) => (
        <PostGridItem
          key={post.id}
          post={post}
          size={index % 9 === 0 ? 'large' : 'normal'}
          onClick={() => onPostClick(post)}
        />
      ))}
    </div>
  )
}

const PostGridItem: React.FC<{
  post: ExplorePost
  size: 'normal' | 'large'
  onClick: () => void
}> = ({ post, size, onClick }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const isVideo = post.media[0]?.type === 'video'
  const aspectRatio = size === 'large' ? 'aspect-square' : 'aspect-square'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.3 }}
      className={`relative cursor-pointer group overflow-hidden bg-gray-200 ${aspectRatio} ${
        size === 'large' ? 'col-span-2 row-span-2' : ''
      }`}
      onClick={onClick}
    >
      {post.media[0] && (
        <>
          {isVideo ? (
            <video
              src={post.media[0].url}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={post.media[0].url}
              alt={post.content}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          
          {/* Video indicator */}
          {isVideo && (
            <div className="absolute top-2 right-2">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          )}
          
          {/* Stats overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 fill-white" />
                <span className="font-semibold">{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 fill-white" />
                <span className="font-semibold">{post.comments}</span>
              </div>
            </div>
          </div>
          
          {/* Multiple media indicator */}
          {post.media.length > 1 && (
            <div className="absolute top-2 right-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white/60 rounded-full" />
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

const TrendingSection: React.FC<{
  topics: TrendingTopic[]
  onHashtagClick: (hashtag: string) => void
}> = ({ topics, onHashtagClick }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-red-500" />
        Trending
      </h2>
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onHashtagClick(topic.hashtag)}
            className="w-full flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium">#{topic.hashtag}</p>
                <p className="text-sm text-gray-500">
                  {topic.postCount.toLocaleString()} posts
                </p>
              </div>
            </div>
            {topic.isPromoted && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                Promoted
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

const SuggestionsSection: React.FC<{
  suggestions: Suggestion[]
  onUserClick: (user: User) => void
  onHashtagClick: (hashtag: string) => void
}> = ({ suggestions, onUserClick, onHashtagClick }) => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Suggested for you</h2>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center gap-3">
              {suggestion.type === 'user' ? (
                <>
                  <img
                    src={(suggestion.data as User).avatar}
                    alt={(suggestion.data as User).displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{(suggestion.data as User).displayName}</p>
                    <p className="text-sm text-gray-500">{suggestion.reason}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{suggestion.data as string}</p>
                    <p className="text-sm text-gray-500">{suggestion.reason}</p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => {
                if (suggestion.type === 'user') {
                  onUserClick(suggestion.data as User)
                } else {
                  onHashtagClick((suggestion.data as string).replace('#', ''))
                }
              }}
              className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
            >
              {suggestion.type === 'user' ? 'Follow' : 'View'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Explore({ 
  currentUser, 
  onPostClick, 
  onUserClick, 
  onHashtagClick,
  onLocationClick 
}: ExploreProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'trending' | 'suggestions'>('posts')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<ExplorePost[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock posts data - in real app, this would come from an API
  useEffect(() => {
    const mockPosts: ExplorePost[] = Array.from({ length: 20 }, (_, i) => ({
      id: `explore-${i}`,
      author: {
        id: `user-${i}`,
        username: `user${i}`,
        displayName: `User ${i}`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop&crop=face`,
        verified: Math.random() > 0.8,
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000),
        joinDate: new Date(),
        email: `user${i}@example.com`,
        mfaEnabled: false,
        backupMethods: [],
        isOnline: Math.random() > 0.5,
        lastSeen: new Date(),
        privacySettings: {
          profileVisibility: 'public',
          storyVisibility: 'public',
          messagePermissions: 'everyone',
          locationSharing: false,
          onlineStatus: true,
          readReceipts: true,
          lastSeen: true
        }
      },
      content: `Explore post ${i + 1}`,
      media: [{
        id: `media-${i}`,
        type: Math.random() > 0.7 ? 'video' : 'image',
        url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=400&fit=crop`,
        thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i}?w=200&h=200&fit=crop`
      }],
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
      likes: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      isLiked: Math.random() > 0.7,
      isShared: false,
      communityNotes: [],
      type: 'post',
      hashtags: [`tag${i}`, `explore${i}`],
      mentions: [],
      privacy: 'public',
      reactions: [],
      tags: [],
      isVideo: Math.random() > 0.7,
      viewCount: Math.floor(Math.random() * 10000)
    }))
    
    setPosts(mockPosts)
  }, [])

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, people, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'posts' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'trending' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'suggestions' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            For You
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pb-16">
        {activeTab === 'posts' && (
          <div className="p-1">
            {filteredPosts.length > 0 ? (
              <PostGrid posts={filteredPosts} onPostClick={onPostClick} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-500 text-center max-w-sm">
                  {searchQuery 
                    ? `No posts found for "${searchQuery}". Try different keywords.`
                    : 'Discover amazing content from the community.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <TrendingSection 
            topics={mockTrendingTopics} 
            onHashtagClick={onHashtagClick} 
          />
        )}

        {activeTab === 'suggestions' && (
          <SuggestionsSection
            suggestions={mockSuggestions}
            onUserClick={onUserClick}
            onHashtagClick={onHashtagClick}
          />
        )}
      </div>
    </div>
  )
}