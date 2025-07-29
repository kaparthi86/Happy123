'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, Zap, Clock, Globe } from 'lucide-react'
import { TrendingTopic } from '@/types'
import aiService from '@/services/aiService'

export default function AITrendingSidebar() {
  const [trends, setTrends] = useState<TrendingTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('24h')

  useEffect(() => {
    loadTrends()
  }, [selectedTimeframe])

  const loadTrends = async () => {
    setIsLoading(true)
    try {
      // In a real app, you'd pass actual posts data
      const trendData = await aiService.analyzeTrends([])
      setTrends(trendData.filter(trend => trend.timeframe === selectedTimeframe))
    } catch (error) {
      console.error('Error loading trends:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toString()
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600'
    if (sentiment < -0.3) return 'text-red-600'
    return 'text-gray-600'
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return '📈'
    if (sentiment < -0.3) return '📉'
    return '➡️'
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 50) return 'text-green-600 bg-green-50'
    if (growth > 20) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">AI Trends</h2>
        </div>
        <div className="flex items-center space-x-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-1 mb-4 p-1 bg-gray-100 rounded-lg">
        {(['1h', '6h', '24h', '7d'] as const).map((timeframe) => (
          <button
            key={timeframe}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
              selectedTimeframe === timeframe
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {timeframe}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {trends.map((trend, index) => (
            <div
              key={trend.id}
              className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                  <h3 className="font-medium text-gray-900">{trend.topic}</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(trend.predictedGrowth)}`}>
                  +{Math.round(trend.predictedGrowth)}%
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>{formatVolume(trend.volume)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{getSentimentIcon(trend.sentiment)}</span>
                    <span className={getSentimentColor(trend.sentiment)}>
                      {trend.sentiment > 0 ? '+' : ''}{(trend.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{trend.timeframe}</span>
                </div>
              </div>

              {/* Related Hashtags */}
              <div className="flex flex-wrap gap-1">
                {trend.relatedHashtags.slice(0, 3).map((hashtag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>

              {/* AI Insights */}
              <div className="mt-2 p-2 bg-blue-50 rounded-md">
                <div className="flex items-center space-x-1 mb-1">
                  <Globe className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">AI Insight</span>
                </div>
                <p className="text-xs text-blue-800">
                  {trend.predictedGrowth > 70 && "🚀 Viral potential detected - high engagement expected"}
                  {trend.predictedGrowth > 40 && trend.predictedGrowth <= 70 && "📊 Steady growth pattern - good opportunity"}
                  {trend.predictedGrowth > 20 && trend.predictedGrowth <= 40 && "📈 Moderate interest - consider timing"}
                  {trend.predictedGrowth <= 20 && "⚡ Emerging topic - early adoption advantage"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Recommendations */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">Smart Recommendations</span>
        </div>
        <div className="space-y-1 text-xs text-purple-800">
          <p>• Best posting time: 2-4 PM for maximum reach</p>
          <p>• Trending hashtags have 3x higher engagement</p>
          <p>• AI suggests focusing on positive sentiment topics</p>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={loadTrends}
        disabled={isLoading}
        className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analyzing...' : 'Refresh Trends'}
      </button>
    </div>
  )
}