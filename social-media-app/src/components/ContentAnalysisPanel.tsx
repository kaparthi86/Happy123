'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Brain, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  TrendingUp,
  Globe,
  Users
} from 'lucide-react'
import { ContentAnalysis } from '@/types'
import aiService from '@/services/aiService'

interface ContentAnalysisPanelProps {
  content: string
  isVisible: boolean
  onClose: () => void
}

export default function ContentAnalysisPanel({ 
  content, 
  isVisible, 
  onClose 
}: ContentAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isVisible && content.length > 20) {
      analyzeContent()
    }
  }, [isVisible, content])

  const analyzeContent = async () => {
    setIsLoading(true)
    try {
      const result = await aiService.analyzeContent(content)
      setAnalysis(result)
    } catch (error) {
      console.error('Error analyzing content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'text-green-600 bg-green-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getToxicityLevel = (score: number) => {
    if (score < 0.3) return { label: 'Clean', color: 'text-green-600 bg-green-50', icon: CheckCircle }
    if (score < 0.6) return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-50', icon: AlertTriangle }
    return { label: 'High Risk', color: 'text-red-600 bg-red-50', icon: Shield }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Content Analysis</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Eye className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Analyzing content...</span>
            </div>
          ) : analysis ? (
            <>
              {/* Sentiment Analysis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Sentiment Analysis</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(analysis.sentiment.label)}`}>
                    {analysis.sentiment.label.charAt(0).toUpperCase() + analysis.sentiment.label.slice(1)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        analysis.sentiment.label === 'positive' ? 'bg-green-500' :
                        analysis.sentiment.label === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${Math.abs(analysis.sentiment.score) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(analysis.sentiment.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              {/* Topics */}
              {analysis.topics.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Detected Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {analysis.entities.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="w-4 h-4 text-orange-600" />
                    <h3 className="font-medium text-gray-900">Named Entities</h3>
                  </div>
                  <div className="space-y-2">
                    {analysis.entities.map((entity, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{entity.text}</span>
                          <span className="ml-2 text-sm text-gray-500 capitalize">({entity.type})</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(entity.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toxicity Detection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-4 h-4 text-red-600" />
                  <h3 className="font-medium text-gray-900">Content Safety</h3>
                </div>
                <div className="flex items-center space-x-4">
                  {(() => {
                    const toxicityInfo = getToxicityLevel(analysis.toxicity.score)
                    const IconComponent = toxicityInfo.icon
                    return (
                      <>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${toxicityInfo.color}`}>
                          <IconComponent className="w-4 h-4" />
                          <span>{toxicityInfo.label}</span>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-red-500"
                            style={{ width: `${analysis.toxicity.score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(analysis.toxicity.score * 100)}%
                        </span>
                      </>
                    )
                  })()}
                </div>
                {analysis.toxicity.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {analysis.toxicity.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Fact Check */}
              {analysis.factCheck && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Fact Check</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        analysis.factCheck.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                        analysis.factCheck.verificationStatus === 'disputed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {analysis.factCheck.verificationStatus}
                      </span>
                    </div>
                    
                    {analysis.factCheck.claims.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-900">Claims detected:</span>
                        <ul className="mt-1 space-y-1">
                          {analysis.factCheck.claims.map((claim, index) => (
                            <li key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-300">
                              {claim}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.factCheck.sources && (
                      <div>
                        <span className="text-sm font-medium text-gray-900">Sources:</span>
                        <ul className="mt-1 space-y-1">
                          {analysis.factCheck.sources.map((source, index) => (
                            <li key={index}>
                              <a 
                                href={source} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                {source}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">AI Recommendations</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  {analysis.sentiment.label === 'negative' && (
                    <li>• Consider rephrasing to convey a more positive tone</li>
                  )}
                  {analysis.toxicity.score > 0.3 && (
                    <li>• Review content for potentially offensive language</li>
                  )}
                  {analysis.topics.length === 0 && (
                    <li>• Add relevant hashtags to increase discoverability</li>
                  )}
                  {analysis.entities.length > 0 && (
                    <li>• Consider tagging mentioned people or organizations</li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Write some content to see AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}