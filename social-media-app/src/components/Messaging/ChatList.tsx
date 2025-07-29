'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MoreVertical, MessageSquare, Users, Archive, Star, Settings } from 'lucide-react'
import { Chat, User, Message } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface ChatListProps {
  chats: Chat[]
  currentUser: User
  onChatSelect: (chat: Chat) => void
  onNewChat: () => void
  selectedChatId?: string
}

export default function ChatList({ 
  chats, 
  currentUser, 
  onChatSelect, 
  onNewChat,
  selectedChatId 
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all')

  const filteredChats = chats
    .filter(chat => {
      // Filter by search query
      if (searchQuery) {
        const chatName = chat.type === 'group' 
          ? chat.name 
          : chat.participants.find(p => p.id !== currentUser.id)?.displayName || ''
        return chatName.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
    .filter(chat => {
      // Filter by tab
      switch (activeTab) {
        case 'unread':
          return chat.unreadCount > 0
        case 'groups':
          return chat.type === 'group'
        default:
          return !chat.isArchived
      }
    })
    .sort((a, b) => {
      // Sort by pinned first, then by last message time
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      const aTime = a.lastMessage?.timestamp || a.createdAt
      const bTime = b.lastMessage?.timestamp || b.createdAt
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group Chat'
    }
    const otherUser = chat.participants.find(p => p.id !== currentUser.id)
    return otherUser?.displayName || 'Unknown User'
  }

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return chat.avatar || '/default-group-avatar.png'
    }
    const otherUser = chat.participants.find(p => p.id !== currentUser.id)
    return otherUser?.avatar || '/default-avatar.png'
  }

  const getLastMessagePreview = (message: Message | undefined) => {
    if (!message) return 'No messages yet'
    
    const senderName = message.sender.id === currentUser.id 
      ? 'You' 
      : message.sender.displayName

    switch (message.type) {
      case 'image':
        return `${senderName}: 📷 Photo`
      case 'video':
        return `${senderName}: 🎥 Video`
      case 'audio':
        return `${senderName}: 🎵 Audio`
      case 'file':
        return `${senderName}: 📎 File`
      case 'location':
        return `${senderName}: 📍 Location`
      default:
        return `${senderName}: ${message.content?.slice(0, 50)}${message.content && message.content.length > 50 ? '...' : ''}`
    }
  }

  const getMessageStatus = (message: Message | undefined) => {
    if (!message || message.sender.id !== currentUser.id) return null
    
    switch (message.status) {
      case 'sending':
        return '⏳'
      case 'sent':
        return '✓'
      case 'delivered':
        return '✓✓'
      case 'read':
        return '✓✓'
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-green-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chats</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={onNewChat}
              className="p-2 hover:bg-green-700 rounded-full transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:bg-white/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'all' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'unread' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'groups' 
              ? 'text-green-600 border-b-2 border-green-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No chats found</p>
            <p className="text-sm text-center px-8">
              {searchQuery 
                ? 'Try searching with different keywords'
                : 'Start a new conversation to see your chats here'
              }
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <motion.button
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                selectedChatId === chat.id ? 'bg-green-50 border-r-4 border-green-600' : ''
              }`}
              whileHover={{ backgroundColor: '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={getChatAvatar(chat)}
                  alt={getChatName(chat)}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.type === 'direct' && (
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    chat.participants.find(p => p.id !== currentUser.id)?.isOnline 
                      ? 'bg-green-500' 
                      : 'bg-gray-400'
                  }`} />
                )}
                {chat.type === 'group' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getChatName(chat)}
                    </h3>
                    {chat.isPinned && (
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                    {chat.isMuted && (
                      <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">🔇</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {getMessageStatus(chat.lastMessage) && (
                      <span className={`text-xs ${
                        chat.lastMessage?.status === 'read' ? 'text-blue-500' : 'text-gray-400'
                      }`}>
                        {getMessageStatus(chat.lastMessage)}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {chat.lastMessage && formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {getLastMessagePreview(chat.lastMessage)}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-around">
          <button className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-green-600 transition-colors">
            <Archive className="w-5 h-5" />
            <span className="text-xs">Archived</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-green-600 transition-colors">
            <Star className="w-5 h-5" />
            <span className="text-xs">Starred</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-2 text-gray-600 hover:text-green-600 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}