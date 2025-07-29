'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal, Play, Verified, FileText } from 'lucide-react'
import { Post } from '@/types'
import { formatTimeAgo, formatNumber } from '@/lib/utils'
import CommunityNote from './CommunityNote'

interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onShare: (postId: string) => void
  onComment: (postId: string) => void
  onCommunityNoteVote: (noteId: string, voteType: 'helpful' | 'notHelpful') => void
}

export default function PostCard({ 
  post, 
  onLike, 
  onShare, 
  onComment, 
  onCommunityNoteVote 
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isShared, setIsShared] = useState(post.isShared)
  const [likes, setLikes] = useState(post.likes)
  const [shares, setShares] = useState(post.shares)
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
    onLike(post.id)
  }

  const handleShare = () => {
    setIsShared(!isShared)
    setShares(prev => isShared ? prev - 1 : prev + 1)
    onShare(post.id)
  }

  const handleAddCommunityNote = () => {
    if (!newNoteContent.trim()) return
    
    // Here you would typically send the note to your backend
    console.log('Adding community note:', {
      postId: post.id,
      content: newNoteContent
    })
    
    setNewNoteContent('')
    setShowAddNote(false)
    alert('Community note submitted for review!')
  }

  const renderMedia = () => {
    if (post.media.length === 0) return null

    return (
      <div className="mt-3">
        {post.media.length === 1 ? (
          <div className="relative">
            {post.media[0].type === 'image' ? (
              <img
                src={post.media[0].url}
                alt={post.media[0].alt || 'Post image'}
                className="w-full rounded-lg object-cover max-h-96"
              />
            ) : (
              <div className="relative">
                <video
                  src={post.media[0].url}
                  poster={post.media[0].thumbnail}
                  className="w-full rounded-lg object-cover max-h-96"
                  controls
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black bg-opacity-50 rounded-full p-3">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {post.media.slice(0, 4).map((media, index) => (
              <div key={media.id} className="relative">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.alt || `Post image ${index + 1}`}
                    className="w-full h-48 rounded-lg object-cover"
                  />
                ) : (
                  <div className="relative">
                    <video
                      src={media.url}
                      poster={media.thumbnail}
                      className="w-full h-48 rounded-lg object-cover"
                      controls
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                {index === 3 && post.media.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      +{post.media.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={post.author.avatar}
            alt={post.author.displayName}
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900">
                {post.author.displayName}
              </h3>
              {post.author.verified && (
                <Verified className="w-4 h-4 text-blue-500" fill="currentColor" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              @{post.author.username} • {formatTimeAgo(post.timestamp)}
            </p>
          </div>
        </div>
        
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {renderMedia()}
      </div>

      {/* Community Notes */}
      {post.communityNotes.length > 0 && (
        <div className="mb-4">
          {post.communityNotes.map((note) => (
            <CommunityNote
              key={note.id}
              note={note}
              onVote={onCommunityNoteVote}
            />
          ))}
        </div>
      )}

      {/* Add Community Note */}
      {showAddNote && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-start space-x-2 mb-3">
            <FileText className="w-4 h-4 text-gray-600 mt-1" />
            <span className="text-sm font-medium text-gray-900">Add Community Note</span>
          </div>
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Provide additional context or fact-check this post..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              Community notes help provide context and fact-check information
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddNote(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCommunityNote}
                disabled={!newNoteContent.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isLiked
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{formatNumber(likes)}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => onComment(post.id)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{formatNumber(post.comments)}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isShared
                ? 'text-green-600 bg-green-50 hover:bg-green-100'
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <Share className="w-5 h-5" />
            <span className="text-sm font-medium">{formatNumber(shares)}</span>
          </button>
        </div>

        {/* Add Community Note Button */}
        <button
          onClick={() => setShowAddNote(!showAddNote)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">Add Note</span>
        </button>
      </div>
    </article>
  )
}