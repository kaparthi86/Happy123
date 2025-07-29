'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, Sparkles, Hash, CheckCircle, X, Loader2 } from 'lucide-react'
import { AIContentSuggestion } from '@/types'
import aiService from '@/services/aiService'

interface AIContentSuggestionsProps {
  content: string
  onApplySuggestion: (suggestion: string, type: AIContentSuggestion['type']) => void
  className?: string
}

export default function AIContentSuggestions({ 
  content, 
  onApplySuggestion, 
  className = '' 
}: AIContentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AIContentSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    const generateSuggestions = async () => {
      if (content.length < 10) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const newSuggestions = await aiService.generateContentSuggestions(content)
        setSuggestions(newSuggestions)
        setShowSuggestions(newSuggestions.length > 0)
      } catch (error) {
        console.error('Error generating suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(generateSuggestions, 1000)
    return () => clearTimeout(debounceTimer)
  }, [content])

  const handleApplySuggestion = (suggestion: AIContentSuggestion) => {
    onApplySuggestion(suggestion.suggestion, suggestion.type)
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]))
    
    // Remove applied suggestion after a delay
    setTimeout(() => {
      setAppliedSuggestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(suggestion.id)
        return newSet
      })
    }, 3000)
  }

  const getSuggestionIcon = (type: AIContentSuggestion['type']) => {
    switch (type) {
      case 'completion':
        return <Sparkles className="w-4 h-4" />
      case 'enhancement':
        return <Lightbulb className="w-4 h-4" />
      case 'hashtag':
        return <Hash className="w-4 h-4" />
      case 'topic':
        return <Lightbulb className="w-4 h-4" />
      default:
        return <Sparkles className="w-4 h-4" />
    }
  }

  const getSuggestionColor = (type: AIContentSuggestion['type']) => {
    switch (type) {
      case 'completion':
        return 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
      case 'enhancement':
        return 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100'
      case 'hashtag':
        return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
      case 'topic':
        return 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
    }
  }

  if (!showSuggestions && !isLoading) return null

  return (
    <div className={`relative ${className}`}>
      {/* AI Suggestions Panel */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">AI Suggestions</span>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          </div>
          <button
            onClick={() => setShowSuggestions(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Generating suggestions...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion) => {
              const isApplied = appliedSuggestions.has(suggestion.id)
              
              return (
                <div
                  key={suggestion.id}
                  className={`border rounded-lg p-3 transition-all ${getSuggestionColor(suggestion.type)} ${
                    isApplied ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-xs font-medium capitalize">
                          {suggestion.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-1">
                        {suggestion.suggestion}
                      </p>
                      
                      {suggestion.context && (
                        <p className="text-xs text-gray-600">
                          {suggestion.context}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      disabled={isApplied}
                      className={`ml-2 px-3 py-1 text-xs rounded-full transition-colors ${
                        isApplied
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border'
                      }`}
                    >
                      {isApplied ? (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Applied</span>
                        </div>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isLoading && suggestions.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Keep writing to get AI-powered suggestions!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}