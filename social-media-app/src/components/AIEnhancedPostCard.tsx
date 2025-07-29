'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  Play, 
  Verified, 
  FileText,
  AlertTriangle,
  Shield,
  Globe,
  Brain,
  Zap,
  Eye,
  BookOpen
} from 'lucide-react'
import { Post, ContentAnalysis, AITranslation, ContentSummary } from '@/types'
import { formatTimeAgo, formatNumber } from '@/lib/utils'
import CommunityNote from './CommunityNote'
import aiService from '@/services/aiService'

interface AIEnhancedPostCardProps {
  post: Post
  onLike: (postId: string) => void
  onShare: (postId: string) => void
  onComment: (postId: string) => void
  onCommunityNoteVote: (noteId: string, voteType: 'helpful' | 'notHelpful') => void
}

export default function AIEnhancedPostCard({ 
  post, 
  onLike, 
  onShare, 
  onComment, 
  onCommunityNoteVote 
}: AIEnhancedPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isShared, setIsShared] = useState(post.isShared)
  const [likes, setLikes] = useState(post.likes)
  const [shares, setShares] = useState(post.shares)
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  
  // AI Features State
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [translation, setTranslation] = useState<AITranslation | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [summary, setSummary] = useState<ContentSummary | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // Automatically analyze content for safety and insights
    analyzeContent()
  }, [post.content])

  const analyzeContent = async () => {
    if (post.content.length < 20) return
    
    setIsAnalyzing(true)
    try {
      const analysis = await aiService.analyzeContent(post.content)
      setContentAnalysis(analysis)
      
      // Auto-generate summary for long posts
      if (post.content.length > 500) {
        const summaryData = await aiService.summarizeContent(post.content)
        setSummary(summaryData)
      }
    } catch (error) {
      console.error('Error analyzing content:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTranslate = async (targetLanguage: string = 'es') => {
    try {
      const translationData = await aiService.translateContent(post.content, targetLanguage)
      setTranslation(translationData)
      setShowTranslation(true)
    } catch (error) {
      console.error('Error translating content:', error)
    }
  }

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
    
    console.log('Adding community note:', {
      postId: post.id,
      content: newNoteContent
    })
    
    setNewNoteContent('')
    setShowAddNote(false)
    alert('Community note submitted for review!')
  }

  const getSentimentIndicator = () => {
    if (!contentAnalysis) return null

    const { sentiment } = contentAnalysis
    let color = 'text-gray-500'
    let emoji = '😐'

    if (sentiment.label === 'positive') {
      color = 'text-green-600'
      emoji = '😊'
    } else if (sentiment.label === 'negative') {
      color = 'text-red-600'
      emoji = '😔'
    }

    return (
      <div className={`flex items-center space-x-1 text-xs ${color}`}>
        <span>{emoji}</span>
        <span className="capitalize">{sentiment.label}</span>
      </div>
    )
  }

  const getContentWarnings = () => {
    if (!contentAnalysis) return null

    const warnings = []
    
    if (contentAnalysis.toxicity.score > 0.3) {
      warnings.push({
        type: 'toxicity',
        message: 'Potentially offensive content detected',
        severity: contentAnalysis.toxicity.score > 0.6 ? 'high' : 'medium'
      })
    }

    if (contentAnalysis.factCheck?.verificationStatus === 'disputed') {
      warnings.push({
        type: 'factcheck',
        message: 'Claims in this post may be disputed',
        severity: 'medium'
      })
    }

    if (warnings.length === 0) return null

    return (
      <div className="mb-3 space-y-2">
        {warnings.map((warning, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 p-2 rounded-lg border ${
              warning.severity === 'high' 
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{warning.message}</span>
          </div>
        ))}
      </div>
    )
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
              {getSentimentIndicator()}
            </div>
            <p className="text-sm text-gray-500">
              @{post.author.username} • {formatTimeAgo(post.timestamp)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isAnalyzing && (
            <div className="flex items-center space-x-1">
              <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-xs text-blue-600">Analyzing...</span>
            </div>
          )}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content Warnings */}
      {getContentWarnings()}

      {/* AI Summary for Long Posts */}
      {summary && !showSummary && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Long post detected ({summary.readingTime} min read)
              </span>
            </div>
            <button
              onClick={() => setShowSummary(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Show Summary
            </button>
          </div>
        </div>
      )}

      {/* AI Summary Content */}
      {showSummary && summary && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">AI Summary</span>
            </div>
            <button
              onClick={() => setShowSummary(false)}
              className="text-xs text-purple-600 hover:text-purple-800"
            >
              Hide
            </button>
          </div>
          <p className="text-sm text-gray-800 mb-2">{summary.summary}</p>
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-700">Key Points:</span>
            <ul className="text-xs text-gray-600 space-y-1">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
          {showTranslation && translation ? translation.translatedText : post.content}
        </p>
        {renderMedia()}
      </div>

      {/* Translation Banner */}
      {showTranslation && translation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                Translated from {translation.sourceLanguage} ({Math.round(translation.confidence * 100)}% confidence)
              </span>
            </div>
            <button
              onClick={() => setShowTranslation(false)}
              className="text-xs text-green-600 hover:text-green-800 font-medium"
            >
              Show Original
            </button>
          </div>
        </div>
      )}

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

        {/* AI Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Translate */}
          <button
            onClick={() => handleTranslate('es')}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs">Translate</span>
          </button>

          {/* Analysis */}
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs">Insights</span>
          </button>

          {/* Add Community Note */}
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">Note</span>
          </button>
        </div>
      </div>

      {/* Detailed Analysis Panel */}
      {showAnalysis && contentAnalysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-3">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-900">AI Content Analysis</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-gray-700">Sentiment:</span>
              <div className={`inline-block ml-2 px-2 py-1 rounded-full ${
                contentAnalysis.sentiment.label === 'positive' ? 'bg-green-100 text-green-700' :
                contentAnalysis.sentiment.label === 'negative' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {contentAnalysis.sentiment.label} ({Math.round(contentAnalysis.sentiment.confidence * 100)}%)
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Safety:</span>
              <div className={`inline-block ml-2 px-2 py-1 rounded-full ${
                contentAnalysis.toxicity.score < 0.3 ? 'bg-green-100 text-green-700' :
                contentAnalysis.toxicity.score < 0.6 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {contentAnalysis.toxicity.score < 0.3 ? 'Safe' :
                 contentAnalysis.toxicity.score < 0.6 ? 'Moderate' : 'High Risk'}
              </div>
            </div>

            {contentAnalysis.topics.length > 0 && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {contentAnalysis.topics.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}