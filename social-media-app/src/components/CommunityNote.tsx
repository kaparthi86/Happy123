'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, ExternalLink, AlertCircle } from 'lucide-react'
import { CommunityNote as CommunityNoteType } from '@/types'
import { formatTimeAgo, formatNumber } from '@/lib/utils'

interface CommunityNoteProps {
  note: CommunityNoteType
  onVote: (noteId: string, voteType: 'helpful' | 'notHelpful') => void
}

export default function CommunityNote({ note, onVote }: CommunityNoteProps) {
  const [userVote, setUserVote] = useState<'helpful' | 'notHelpful' | null>(note.userVote || null)
  const [votes, setVotes] = useState(note.votes)

  const handleVote = (voteType: 'helpful' | 'notHelpful') => {
    if (userVote === voteType) {
      // Remove vote
      setVotes(prev => ({
        ...prev,
        [voteType]: prev[voteType] - 1
      }))
      setUserVote(null)
      onVote(note.id, voteType)
    } else {
      // Add or change vote
      const newVotes = { ...votes }
      
      if (userVote) {
        // Remove previous vote
        newVotes[userVote] = newVotes[userVote] - 1
      }
      
      // Add new vote
      newVotes[voteType] = newVotes[voteType] + 1
      
      setVotes(newVotes)
      setUserVote(voteType)
      onVote(note.id, voteType)
    }
  }

  const getStatusColor = () => {
    switch (note.status) {
      case 'approved':
        return 'border-green-200 bg-green-50'
      case 'pending':
        return 'border-yellow-200 bg-yellow-50'
      case 'rejected':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch (note.status) {
      case 'approved':
        return <AlertCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className={`mt-3 p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getStatusIcon()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-900">Community Note</span>
            <span className="text-xs text-gray-500">
              by @{note.author.username} • {formatTimeAgo(note.timestamp)}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 mb-3 leading-relaxed">
            {note.content}
          </p>

          {/* Sources */}
          {note.sources && note.sources.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Sources:</h4>
              <div className="space-y-1">
                {note.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {new URL(source).hostname}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Voting */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Is this note helpful?</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote('helpful')}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                  userVote === 'helpful'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{formatNumber(votes.helpful)}</span>
              </button>
              
              <button
                onClick={() => handleVote('notHelpful')}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                  userVote === 'notHelpful'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
                <span>{formatNumber(votes.notHelpful)}</span>
              </button>
            </div>

            {/* Helpfulness Ratio */}
            <div className="text-xs text-gray-500">
              {Math.round((votes.helpful / (votes.helpful + votes.notHelpful)) * 100)}% found helpful
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}