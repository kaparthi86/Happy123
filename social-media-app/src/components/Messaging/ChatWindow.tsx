'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Mic, 
  Camera,
  Smile,
  ArrowLeft,
  Check,
  CheckCheck
} from 'lucide-react'
import { Chat, Message, User, MessageReaction } from '@/types'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import EmojiPicker from '@emoji-mart/react'
import data from '@emoji-mart/data'

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  currentUser: User
  onSendMessage: (content: string, type?: Message['type'], media?: any) => void
  onBackClick: () => void
  onVoiceCall: () => void
  onVideoCall: () => void
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  onReaction: (messageId: string, emoji: string) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwn, 
  showAvatar,
  onReaction 
}) => {
  const [showReactions, setShowReactions] = useState(false)
  const [showTime, setShowTime] = useState(false)

  const getStatusIcon = () => {
    if (!isOwn) return null
    
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img 
              src={message.media?.[0]?.url} 
              alt="Image" 
              className="rounded-lg max-w-full h-auto"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      case 'video':
        return (
          <div className="max-w-xs">
            <video 
              src={message.media?.[0]?.url} 
              controls 
              className="rounded-lg max-w-full h-auto"
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        )
      case 'audio':
        return (
          <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg">
            <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5" />
            </button>
            <div className="flex-1">
              <div className="h-1 bg-gray-300 rounded-full">
                <div className="h-full w-1/3 bg-green-500 rounded-full" />
              </div>
              <p className="text-xs text-gray-500 mt-1">0:15</p>
            </div>
          </div>
        )
      case 'location':
        return (
          <div className="max-w-xs">
            <div className="bg-gray-200 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-sm font-medium">Location Shared</p>
              <p className="text-xs text-gray-500">Tap to view</p>
            </div>
          </div>
        )
      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && showAvatar && (
        <img
          src={message.sender.avatar}
          alt={message.sender.displayName}
          className="w-8 h-8 rounded-full mt-auto"
        />
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}
      
      <div 
        className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}
        onClick={() => setShowTime(!showTime)}
      >
        {/* Reply indicator */}
        {message.replyTo && (
          <div className={`text-xs p-2 rounded-t-lg border-l-4 ${
            isOwn 
              ? 'bg-green-100 border-green-500 text-green-800' 
              : 'bg-gray-100 border-gray-400 text-gray-600'
          }`}>
            <p className="font-medium">{message.replyTo.sender.displayName}</p>
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`relative p-3 rounded-lg ${
            isOwn 
              ? 'bg-green-500 text-white' 
              : 'bg-white border text-gray-900'
          }`}
          onDoubleClick={() => setShowReactions(true)}
        >
          {renderMessageContent()}
          
          {/* Message reactions */}
          {message.reactions.length > 0 && (
            <div className="absolute -bottom-2 left-2 flex gap-1">
              {message.reactions.reduce((acc, reaction) => {
                const existing = acc.find(r => r.emoji === reaction.emoji)
                if (existing) {
                  existing.count++
                } else {
                  acc.push({ emoji: reaction.emoji, count: 1 })
                }
                return acc
              }, [] as { emoji: string; count: number }[]).map((reaction, index) => (
                <span
                  key={index}
                  className="bg-white border rounded-full px-1 py-0.5 text-xs shadow-sm"
                >
                  {reaction.emoji} {reaction.count > 1 && reaction.count}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Timestamp and status */}
        <AnimatePresence>
          {showTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                isOwn ? 'justify-end' : 'justify-start'
              }`}
            >
              <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
              {getStatusIcon()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick reactions */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-10 bg-white border rounded-lg p-2 shadow-lg"
            style={{
              top: '50%',
              [isOwn ? 'right' : 'left']: '100%',
              transform: 'translateY(-50%)'
            }}
          >
            <div className="flex gap-2">
              {['❤️', '😂', '😮', '😢', '😡', '👍'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReaction(message.id, emoji)
                    setShowReactions(false)
                  }}
                  className="text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ChatWindow({ 
  chat, 
  messages, 
  currentUser, 
  onSendMessage, 
  onBackClick,
  onVoiceCall,
  onVideoCall 
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const otherUser = chat.type === 'direct' 
    ? chat.participants.find(p => p.id !== currentUser.id)
    : null

  const chatName = chat.type === 'group' 
    ? chat.name || 'Group Chat'
    : otherUser?.displayName || 'Unknown User'

  const chatAvatar = chat.type === 'group'
    ? chat.avatar || '/default-group-avatar.png'
    : otherUser?.avatar || '/default-avatar.png'

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = format(new Date(message.timestamp), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
      setReplyTo(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Handle file upload logic here
      console.log('File uploaded:', file)
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMMM d, yyyy')
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-3">
        <button
          onClick={onBackClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <img
          src={chatAvatar}
          alt={chatName}
          className="w-10 h-10 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">{chatName}</h2>
          <p className="text-sm text-gray-500">
            {chat.type === 'direct' && otherUser?.isOnline 
              ? 'Online' 
              : chat.type === 'group' 
                ? `${chat.participants.length} members`
                : `Last seen ${formatDistanceToNow(new Date(otherUser?.lastSeen || Date.now()))} ago`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onVoiceCall}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={onVideoCall}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([dateStr, dayMessages]) => (
          <div key={dateStr}>
            {/* Date header */}
            <div className="text-center mb-4">
              <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                {formatDateHeader(dateStr)}
              </span>
            </div>
            
            {/* Messages for this day */}
            {dayMessages.map((message, index) => {
              const isOwn = message.sender.id === currentUser.id
              const prevMessage = dayMessages[index - 1]
              const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onReaction={(messageId, emoji) => {
                    console.log('React to message:', messageId, emoji)
                  }}
                />
              )
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <img
              src={otherUser?.avatar}
              alt="Typing"
              className="w-8 h-8 rounded-full"
            />
            <div className="bg-white border rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mx-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Replying to {replyTo.sender.displayName}
              </p>
              <p className="text-sm text-blue-600 truncate">
                {replyTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-blue-500 hover:text-blue-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="bg-white border-t p-4">
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          {newMessage.trim() ? (
            <button
              onClick={handleSend}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4 z-50">
            <EmojiPicker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
            />
          </div>
        )}
      </div>
    </div>
  )
}