'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'
import CommentsModal from '@/components/CommentsModal'
import { mockPosts } from '@/data/mockData'

export default function Home() {
  const [posts, setPosts] = useState(mockPosts)
  const [selectedPost, setSelectedPost] = useState<typeof mockPosts[0] | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)

  const handleLike = (postId: string) => {
    console.log('Liked post:', postId)
    // Here you would typically update the like status in your backend
  }

  const handleShare = (postId: string) => {
    console.log('Shared post:', postId)
    // Here you would typically handle sharing functionality
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
    // Here you would typically update the vote in your backend
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Feed */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            <CreatePost />
            
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

          {/* Sidebar */}
          <Sidebar />
        </div>
      </main>

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
    </div>
  )
}
