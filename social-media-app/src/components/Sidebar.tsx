'use client'

import { TrendingUp, Users, Hash, Plus, Verified } from 'lucide-react'
import { mockUsers } from '@/data/mockData'
import { formatNumber } from '@/lib/utils'

const trendingTopics = [
  { tag: 'NextJS', posts: 15400 },
  { tag: 'AI', posts: 23100 },
  { tag: 'WebDev', posts: 8900 },
  { tag: 'React', posts: 12300 },
  { tag: 'TypeScript', posts: 7600 }
]

const suggestedUsers = mockUsers.slice(1)

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-80 space-y-6 order-first lg:order-last">
      {/* Trending Topics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Trending</h2>
        </div>
        
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div
              key={topic.tag}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-sm font-semibold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{topic.tag}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatNumber(topic.posts)} posts
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Show more
        </button>
      </div>

      {/* Suggested Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Who to follow</h2>
        </div>
        
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user.avatar}
                  alt={user.displayName}
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {user.displayName}
                    </h3>
                    {user.verified && (
                      <Verified className="w-3 h-3 text-blue-500" fill="currentColor" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="text-xs text-gray-400">
                    {formatNumber(user.followers)} followers
                  </p>
                </div>
              </div>
              
              <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Show more
        </button>
      </div>

      {/* Communities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Communities</h2>
          </div>
          <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'Web Developers', members: 45600, color: 'bg-blue-100 text-blue-600' },
            { name: 'AI Enthusiasts', members: 32100, color: 'bg-purple-100 text-purple-600' },
            { name: 'Startup Founders', members: 18900, color: 'bg-green-100 text-green-600' },
            { name: 'Design Community', members: 27400, color: 'bg-pink-100 text-pink-600' }
          ].map((community) => (
            <div
              key={community.name}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${community.color}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {community.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatNumber(community.members)} members
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          Discover more
        </button>
      </div>

      {/* Footer Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <a href="#" className="hover:text-gray-700">About</a>
          <a href="#" className="hover:text-gray-700">Privacy</a>
          <a href="#" className="hover:text-gray-700">Terms</a>
          <a href="#" className="hover:text-gray-700">Help</a>
          <a href="#" className="hover:text-gray-700">Advertise</a>
          <a href="#" className="hover:text-gray-700">Careers</a>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          © 2024 SocialHub. All rights reserved.
        </p>
      </div>
    </aside>
  )
}