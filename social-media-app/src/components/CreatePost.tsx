'use client'

import { useState, useRef } from 'react'
import { Image, Video, Smile, MapPin, Calendar, X, Sparkles, Brain } from 'lucide-react'
import { currentUser } from '@/data/mockData'
import { handleFileUpload, isImageFile, isVideoFile, validateFileSize } from '@/lib/utils'
import AIContentSuggestions from './AIContentSuggestions'
import ContentAnalysisPanel from './ContentAnalysisPanel'
import { AIContentSuggestion } from '@/types'

interface MediaPreview {
  id: string
  type: 'image' | 'video'
  url: string
  file: File
}

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files) return

    const newMediaFiles: MediaPreview[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (!validateFileSize(file)) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        continue
      }

      if (type === 'image' && !isImageFile(file)) {
        alert(`${file.name} is not a valid image file.`)
        continue
      }

      if (type === 'video' && !isVideoFile(file)) {
        alert(`${file.name} is not a valid video file.`)
        continue
      }

      try {
        const url = await handleFileUpload(file)
        newMediaFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          type,
          url,
          file
        })
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }

    setMediaFiles(prev => [...prev, ...newMediaFiles])
  }

  const removeMedia = (id: string) => {
    setMediaFiles(prev => prev.filter(media => media.id !== id))
  }

  const handleApplySuggestion = (suggestion: string, type: AIContentSuggestion['type']) => {
    if (type === 'completion') {
      setContent(prev => prev + suggestion)
    } else if (type === 'enhancement') {
      setContent(suggestion)
    } else if (type === 'hashtag') {
      setContent(prev => prev + ' ' + suggestion)
    } else if (type === 'topic') {
      setContent(prev => prev + ' ' + suggestion)
    }
  }

  const handleSubmit = () => {
    if (!content.trim() && mediaFiles.length === 0) {
      alert('Please add some content or media to your post.')
      return
    }

    // Here you would typically send the post data to your backend
    console.log('Submitting post:', {
      content,
      media: mediaFiles.map(m => ({ type: m.type, file: m.file }))
    })

    // Reset form
    setContent('')
    setMediaFiles([])
    setIsExpanded(false)
    setShowAISuggestions(false)
    
    alert('Post created successfully!')
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex space-x-3">
        <img
          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          src={currentUser.avatar}
          alt={currentUser.displayName}
        />
        <div className="flex-1 relative">
          <textarea
            className="w-full resize-none border-none outline-none text-lg placeholder-gray-500"
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            rows={isExpanded ? 3 : 1}
          />

          {/* AI Content Suggestions */}
          {showAISuggestions && (
            <AIContentSuggestions
              content={content}
              onApplySuggestion={handleApplySuggestion}
              className="mt-2"
            />
          )}

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {mediaFiles.map((media) => (
                <div key={media.id} className="relative group">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt="Upload preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <button
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 rounded-full text-white hover:bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Expanded Options */}
          {isExpanded && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Image Upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span>Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files, 'image')}
                />

                {/* Video Upload */}
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files, 'video')}
                />

                {/* AI Suggestions Toggle */}
                <button 
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                    showAISuggestions 
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Assist</span>
                </button>

                {/* Other Options */}
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Smile className="w-4 h-4" />
                  <span>Emoji</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                <button 
                  onClick={() => setShowAnalysisPanel(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Analyze</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {/* Character Counter */}
                <div className="text-sm text-gray-500">
                  {content.length}/280
                </div>

                {/* Post Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() && mediaFiles.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Analysis Panel */}
      <ContentAnalysisPanel
        content={content}
        isVisible={showAnalysisPanel}
        onClose={() => setShowAnalysisPanel(false)}
      />
    </div>
  )
}