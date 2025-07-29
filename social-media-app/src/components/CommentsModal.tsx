'use client'

import { useState } from 'react'
import { X, Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import { Comment, Post } from '@/types'
import { formatTimeAgo, formatNumber } from '@/lib/utils'
import { currentUser, mockComments } from '@/data/mockData'

interface CommentsModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
}

interface CommentItemProps {
  comment: Comment
  onLike: (commentId: string) => void
  onReply: (commentId: string, content: string) => void
  level?: number
}

function CommentItem({ comment, onLike, onReply, level = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isLiked, setIsLiked] = useState(comment.isLiked)
  const [likes, setLikes] = useState(comment.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
    onLike(comment.id)
  }

  const handleReply = () => {
    if (!replyContent.trim()) return
    onReply(comment.id, replyContent)
    setReplyContent('')
    setIsReplying(false)
  }

  return (
    <div className={`${level > 0 ? 'ml-12 mt-4' : 'mb-6'}`}>
      <div className="flex space-x-3">
        <img
          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
          src={comment.author.avatar}
          alt={comment.author.displayName}
        />
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">
                {comment.author.displayName}
              </span>
              <span className="text-xs text-gray-500">
                @{comment.author.username}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(comment.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-900">{comment.content}</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-xs transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes > 0 ? formatNumber(likes) : 'Like'}</span>
            </button>
            
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Reply</span>
            </button>
            
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <MoreHorizontal className="w-3 h-3 text-gray-500" />
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 flex space-x-2">
              <img
                className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                src={currentUser.avatar}
                alt={currentUser.displayName}
              />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentsModal({ post, isOpen, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState(mockComments)
  const [newComment, setNewComment] = useState('')

  if (!isOpen) return null

  const handleAddComment = () => {
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      author: currentUser,
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    }
    
    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const handleLikeComment = (commentId: string) => {
    console.log('Liked comment:', commentId)
  }

  const handleReplyToComment = (commentId: string, content: string) => {
    console.log('Reply to comment:', commentId, content)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Post Preview */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex space-x-3">
              <img
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                src={post.author.avatar}
                alt={post.author.displayName}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {post.author.displayName}
                  </span>
                  <span className="text-xs text-gray-500">
                    @{post.author.username}
                  </span>
                </div>
                <p className="text-sm text-gray-900 line-clamp-3">
                  {post.content}
                </p>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No comments yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              <div>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onLike={handleLikeComment}
                    onReply={handleReplyToComment}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Add Comment */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <img
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                src={currentUser.avatar}
                alt={currentUser.displayName}
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">
                    {newComment.length}/280
                  </span>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}