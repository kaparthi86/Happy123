'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Plus, Play, Pause, Volume2, VolumeX, Send, Heart, MessageCircle } from 'lucide-react'
import Webcam from 'react-webcam'
import { Story, User, StoryView } from '@/types'

interface StoriesProps {
  stories: Story[]
  currentUser: User
  onStoryView: (storyId: string) => void
  onStoryCreate: (story: Omit<Story, 'id' | 'timestamp' | 'expiresAt' | 'views'>) => void
}

interface StoryViewerProps {
  stories: Story[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  onStoryView: (storyId: string) => void
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onStoryView
}) => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<NodeJS.Timeout>()

  const currentStory = stories[currentIndex]

  const startProgress = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    
    const duration = currentStory.media.type === 'video' ? (currentStory.media.duration || 15) : 5
    const increment = 100 / (duration * 10) // Update every 100ms
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current!)
          onNext()
          return 0
        }
        return prev + increment
      })
    }, 100)
  }, [currentStory, onNext])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        clearInterval(progressInterval.current!)
      } else {
        videoRef.current.play()
        startProgress()
      }
    }
  }

  React.useEffect(() => {
    onStoryView(currentStory.id)
    setProgress(0)
    startProgress()
    
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [currentIndex, startProgress, onStoryView, currentStory.id])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src={currentStory.author.avatar}
            alt={currentStory.author.displayName}
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <div>
            <p className="text-white font-medium text-sm">{currentStory.author.displayName}</p>
            <p className="text-white/70 text-xs">
              {new Date(currentStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Story content */}
      <div className="relative w-full max-w-sm h-full flex items-center justify-center">
        {currentStory.media.type === 'image' ? (
          <img
            src={currentStory.media.url}
            alt="Story"
            className="w-full h-full object-cover"
            style={{ backgroundColor: currentStory.backgroundColor }}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentStory.media.url}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            onEnded={onNext}
          />
        )}

        {/* Text overlay */}
        {currentStory.text && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-xl font-bold text-center px-4 drop-shadow-lg">
              {currentStory.text}
            </p>
          </div>
        )}

        {/* Stickers */}
        {currentStory.stickers?.map((sticker, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `rotate(${sticker.rotation || 0}deg) scale(${sticker.scale || 1})`
            }}
          >
            {sticker.type === 'emoji' && (
              <span className="text-4xl">{sticker.data.emoji}</span>
            )}
            {sticker.type === 'mention' && (
              <span className="bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                @{sticker.data.username}
              </span>
            )}
            {sticker.type === 'hashtag' && (
              <span className="bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                #{sticker.data.hashtag}
              </span>
            )}
            {sticker.type === 'location' && (
              <div className="bg-black/50 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <span>📍</span>
                <span>{sticker.data.name}</span>
              </div>
            )}
          </div>
        ))}

        {/* Navigation areas */}
        <button
          className="absolute left-0 top-0 w-1/3 h-full"
          onClick={onPrevious}
        />
        <button
          className="absolute right-0 top-0 w-1/3 h-full"
          onClick={onNext}
        />
        <button
          className="absolute center top-0 w-1/3 h-full"
          onClick={handlePlayPause}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {currentStory.media.type === 'video' && (
            <>
              <button
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <MessageCircle className="w-5 h-5" />
          </button>
          <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const StoryCreator: React.FC<{
  isOpen: boolean
  onClose: () => void
  onStoryCreate: (story: Omit<Story, 'id' | 'timestamp' | 'expiresAt' | 'views'>) => void
  currentUser: User
}> = ({ isOpen, onClose, onStoryCreate, currentUser }) => {
  const [mode, setMode] = useState<'camera' | 'text'>('camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const webcamRef = useRef<Webcam>(null)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
    }
  }, [webcamRef])

  const handleCreateStory = () => {
    if (mode === 'camera' && capturedImage) {
      onStoryCreate({
        author: currentUser,
        media: {
          id: Date.now().toString(),
          type: 'image',
          url: capturedImage,
        },
        type: 'photo',
        privacy: 'friends',
        stickers: [],
      })
    } else if (mode === 'text' && text.trim()) {
      onStoryCreate({
        author: currentUser,
        media: {
          id: Date.now().toString(),
          type: 'image',
          url: '',
        },
        type: 'text',
        text: text.trim(),
        backgroundColor,
        privacy: 'friends',
        stickers: [],
      })
    }
    
    onClose()
    setCapturedImage(null)
    setText('')
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMode('camera')}
            className={`px-4 py-2 rounded-full transition-colors ${
              mode === 'camera' ? 'bg-white text-black' : 'bg-white/20 text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-2 rounded-full transition-colors ${
              mode === 'text' ? 'bg-white text-black' : 'bg-white/20 text-white'
            }`}
          >
            Aa
          </button>
        </div>

        <button
          onClick={handleCreateStory}
          disabled={
            (mode === 'camera' && !capturedImage) || 
            (mode === 'text' && !text.trim())
          }
          className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Share
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {mode === 'camera' ? (
          <div className="relative w-full max-w-sm h-full">
            {!capturedImage ? (
              <>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={capture}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full" />
                </button>
              </>
            ) : (
              <>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setCapturedImage(null)}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-white/20 text-white rounded-full"
                >
                  Retake
                </button>
              </>
            )}
          </div>
        ) : (
          <div 
            className="relative w-full max-w-sm h-full flex items-center justify-center"
            style={{ backgroundColor }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your story..."
              className="w-full h-full bg-transparent text-white text-center text-xl font-bold resize-none outline-none p-8"
              maxLength={200}
            />
            
            {/* Color picker */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {['#000000', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'].map(color => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    backgroundColor === color ? 'border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Stories({ stories, currentUser, onStoryView, onStoryCreate }: StoriesProps) {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null)
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)

  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    const userId = story.author.id
    if (!acc[userId]) {
      acc[userId] = []
    }
    acc[userId].push(story)
    return acc
  }, {} as Record<string, Story[]>)

  const userStories = Object.entries(storiesByUser).map(([userId, userStoryList]) => ({
    user: userStoryList[0].author,
    stories: userStoryList,
    hasUnseen: userStoryList.some(story => 
      !story.views.some(view => view.user.id === currentUser.id)
    )
  }))

  const handleStoryClick = (userStories: Story[], storyIndex: number = 0) => {
    const allStoriesFlat = userStories
    const globalIndex = stories.indexOf(allStoriesFlat[storyIndex])
    setSelectedStoryIndex(globalIndex)
  }

  const handleNext = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1)
    } else {
      setSelectedStoryIndex(null)
    }
  }

  const handlePrevious = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1)
    }
  }

  return (
    <>
      <div className="flex gap-4 p-4 overflow-x-auto bg-white border-b">
        {/* Add story button */}
        <button
          onClick={() => setIsCreatorOpen(true)}
          className="flex-shrink-0 flex flex-col items-center gap-2 group"
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt="Your story"
              className="w-16 h-16 rounded-full border-2 border-gray-300"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <span className="text-xs text-gray-600 group-hover:text-gray-800">Your story</span>
        </button>

        {/* User stories */}
        {userStories.map(({ user, stories: userStoryList, hasUnseen }) => (
          <button
            key={user.id}
            onClick={() => handleStoryClick(userStoryList)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className={`p-0.5 rounded-full ${hasUnseen ? 'bg-gradient-to-tr from-yellow-400 to-pink-600' : 'bg-gray-300'}`}>
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-16 h-16 rounded-full border-2 border-white"
              />
            </div>
            <span className="text-xs text-gray-600 group-hover:text-gray-800 max-w-[70px] truncate">
              {user.displayName}
            </span>
          </button>
        ))}
      </div>

      {/* Story viewer */}
      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer
            stories={stories}
            currentIndex={selectedStoryIndex}
            onClose={() => setSelectedStoryIndex(null)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onStoryView={onStoryView}
          />
        )}
      </AnimatePresence>

      {/* Story creator */}
      <AnimatePresence>
        {isCreatorOpen && (
          <StoryCreator
            isOpen={isCreatorOpen}
            onClose={() => setIsCreatorOpen(false)}
            onStoryCreate={onStoryCreate}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </>
  )
}