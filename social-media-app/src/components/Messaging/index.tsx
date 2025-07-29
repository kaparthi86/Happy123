'use client'

import { useState } from 'react'
import { Chat, Message, User } from '@/types'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'

interface MessagingProps {
  currentUser: User
  initialChats?: Chat[]
  initialMessages?: Record<string, Message[]>
}

export default function Messaging({ 
  currentUser, 
  initialChats = [], 
  initialMessages = {} 
}: MessagingProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [messages, setMessages] = useState<Record<string, Message[]>>(initialMessages)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat)
    setIsMobileView(true)
    
    // Mark messages as read
    setChats(prev => prev.map(c => 
      c.id === chat.id ? { ...c, unreadCount: 0 } : c
    ))
  }

  const handleNewChat = () => {
    // Handle new chat creation
    console.log('Create new chat')
  }

  const handleSendMessage = (content: string, type: Message['type'] = 'text', media?: any) => {
    if (!selectedChat) return

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: selectedChat.id,
      sender: currentUser,
      content,
      timestamp: new Date(),
      type,
      media: media ? [media] : undefined,
      reactions: [],
      status: 'sending'
    }

    // Add message to messages
    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }))

    // Update chat's last message
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: newMessage }
        : chat
    ))

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: prev[selectedChat.id]?.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        ) || []
      }))
    }, 1000)

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: prev[selectedChat.id]?.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        ) || []
      }))
    }, 2000)
  }

  const handleBackClick = () => {
    setIsMobileView(false)
    setSelectedChat(null)
  }

  const handleVoiceCall = () => {
    console.log('Start voice call')
    // Implement voice call functionality
  }

  const handleVideoCall = () => {
    console.log('Start video call')
    // Implement video call functionality
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Chat List - Hidden on mobile when chat is selected */}
      <div className={`w-full lg:w-1/3 xl:w-1/4 ${
        isMobileView && selectedChat ? 'hidden lg:block' : 'block'
      }`}>
        <ChatList
          chats={chats}
          currentUser={currentUser}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          selectedChatId={selectedChat?.id}
        />
      </div>

      {/* Chat Window - Hidden on mobile when no chat is selected */}
      <div className={`flex-1 ${
        !selectedChat ? 'hidden lg:flex' : 'flex'
      }`}>
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            messages={messages[selectedChat.id] || []}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onBackClick={handleBackClick}
            onVoiceCall={handleVoiceCall}
            onVideoCall={handleVideoCall}
          />
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center h-full bg-white">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to Messages
              </h2>
              <p className="text-gray-600 max-w-md">
                Select a chat from the sidebar to start messaging, or create a new conversation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Export individual components for use elsewhere
export { ChatList, ChatWindow }