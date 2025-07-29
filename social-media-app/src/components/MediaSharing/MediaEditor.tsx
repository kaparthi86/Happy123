'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  RotateCcw, 
  Crop, 
  Sliders, 
  Type, 
  Sticker,
  Download,
  Check,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { MediaItem } from '@/types'
import { useDropzone } from 'react-dropzone'

interface MediaEditorProps {
  media: MediaItem[]
  isOpen: boolean
  onClose: () => void
  onSave: (editedMedia: MediaItem[]) => void
}

interface Filter {
  name: string
  css: string
  preview: string
}

const filters: Filter[] = [
  { name: 'Normal', css: '', preview: 'brightness(1)' },
  { name: 'Clarendon', css: 'contrast(1.2) saturate(1.35)', preview: 'contrast(1.2) saturate(1.35)' },
  { name: 'Gingham', css: 'brightness(1.05) hue-rotate(-10deg)', preview: 'brightness(1.05) hue-rotate(-10deg)' },
  { name: 'Moon', css: 'grayscale(1) contrast(1.1) brightness(1.1)', preview: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { name: 'Lark', css: 'contrast(0.9)', preview: 'contrast(0.9)' },
  { name: 'Reyes', css: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)', preview: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)' },
  { name: 'Juno', css: 'contrast(1.2) brightness(1.1) saturate(1.4)', preview: 'contrast(1.2) brightness(1.1) saturate(1.4)' },
  { name: 'Slumber', css: 'saturate(0.66) brightness(1.05)', preview: 'saturate(0.66) brightness(1.05)' },
  { name: 'Crema', css: 'contrast(1.05) brightness(1.05) saturate(1.05)', preview: 'contrast(1.05) brightness(1.05) saturate(1.05)' },
  { name: 'Ludwig', css: 'contrast(1.05) brightness(1.05) saturate(1.03)', preview: 'contrast(1.05) brightness(1.05) saturate(1.03)' },
  { name: 'Aden', css: 'contrast(0.9) brightness(1.2) hue-rotate(-20deg) saturate(0.85)', preview: 'contrast(0.9) brightness(1.2) hue-rotate(-20deg) saturate(0.85)' },
  { name: 'Perpetua', css: 'contrast(1.05) brightness(1.05) saturate(1.1)', preview: 'contrast(1.05) brightness(1.05) saturate(1.1)' }
]

interface Adjustment {
  brightness: number
  contrast: number
  saturation: number
  warmth: number
  fade: number
  highlights: number
  shadows: number
  vignette: number
  sharpen: number
}

export default function MediaEditor({ media, isOpen, onClose, onSave }: MediaEditorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'filter' | 'adjust' | 'crop' | 'text'>('filter')
  const [selectedFilter, setSelectedFilter] = useState<Filter>(filters[0])
  const [adjustments, setAdjustments] = useState<Adjustment>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    fade: 0,
    highlights: 0,
    shadows: 0,
    vignette: 0,
    sharpen: 0
  })
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const [textOverlays, setTextOverlays] = useState<Array<{
    id: string
    text: string
    x: number
    y: number
    fontSize: number
    color: string
    fontFamily: string
  }>>([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const currentMedia = media[currentIndex]

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    onDrop: (acceptedFiles) => {
      // Handle additional media files
      console.log('Additional files:', acceptedFiles)
    }
  })

  const applyFiltersAndAdjustments = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    // Apply filter
    ctx.filter = selectedFilter.css

    // Apply adjustments
    const brightness = 1 + adjustments.brightness / 100
    const contrast = 1 + adjustments.contrast / 100
    const saturation = 1 + adjustments.saturation / 100
    
    ctx.filter += ` brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`

    ctx.drawImage(img, 0, 0)
  }, [selectedFilter, adjustments])

  useEffect(() => {
    if (currentMedia?.type === 'image') {
      applyFiltersAndAdjustments()
    }
  }, [currentMedia, applyFiltersAndAdjustments])

  const handleNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSave = () => {
    // Apply all edits and save
    const editedMedia = media.map((item, index) => {
      if (index === currentIndex && item.type === 'image') {
        return {
          ...item,
          filters: [selectedFilter.name],
          // Add other editing data
        }
      }
      return item
    })
    
    onSave(editedMedia)
    onClose()
  }

  const addTextOverlay = () => {
    const newText = {
      id: Date.now().toString(),
      text: 'Double tap to edit',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#ffffff',
      fontFamily: 'Arial'
    }
    setTextOverlays([...textOverlays, newText])
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
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h1 className="text-lg font-semibold">Edit Media</h1>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Check className="w-5 h-5" />
        </button>
      </div>

      {/* Media Display */}
      <div className="flex-1 flex items-center justify-center bg-black relative">
        {currentMedia?.type === 'image' ? (
          <div className="relative max-w-full max-h-full">
            <img
              ref={imageRef}
              src={currentMedia.url}
              alt="Edit"
              className="max-w-full max-h-full object-contain"
              style={{
                filter: selectedFilter.css + 
                  ` brightness(${1 + adjustments.brightness / 100})` +
                  ` contrast(${1 + adjustments.contrast / 100})` +
                  ` saturate(${1 + adjustments.saturation / 100})`
              }}
              onLoad={applyFiltersAndAdjustments}
            />
            
            {/* Text overlays */}
            {textOverlays.map((textOverlay) => (
              <div
                key={textOverlay.id}
                className="absolute cursor-move"
                style={{
                  left: `${textOverlay.x}%`,
                  top: `${textOverlay.y}%`,
                  fontSize: `${textOverlay.fontSize}px`,
                  color: textOverlay.color,
                  fontFamily: textOverlay.fontFamily,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}
                onDoubleClick={() => {
                  const newText = prompt('Edit text:', textOverlay.text)
                  if (newText !== null) {
                    setTextOverlays(prev => prev.map(t => 
                      t.id === textOverlay.id ? { ...t, text: newText } : t
                    ))
                  }
                }}
              >
                {textOverlay.text}
              </div>
            ))}
            
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
        ) : currentMedia?.type === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            className="max-w-full max-h-full"
          />
        ) : null}

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === media.length - 1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Media indicator */}
        {media.length > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {media.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editing Tools */}
      <div className="bg-gray-900 text-white">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('filter')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'filter' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            Filters
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'adjust' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            <Sliders className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setActiveTab('crop')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'crop' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            <Crop className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'text' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'
            }`}
          >
            <Type className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-48 overflow-y-auto">
          {activeTab === 'filter' && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filters.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex-shrink-0 text-center ${
                    selectedFilter.name === filter.name ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  <div 
                    className="w-16 h-16 bg-gray-600 rounded-lg mb-2 border-2 transition-colors"
                    style={{ 
                      filter: filter.preview,
                      borderColor: selectedFilter.name === filter.name ? '#60a5fa' : 'transparent'
                    }}
                  />
                  <span className="text-xs">{filter.name}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'adjust' && (
            <div className="space-y-4">
              {Object.entries(adjustments).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="w-20 text-sm capitalize">{key}</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={value}
                    onChange={(e) => setAdjustments(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value)
                    }))}
                    className="flex-1"
                  />
                  <span className="w-12 text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'crop' && (
            <div className="text-center">
              <p className="text-gray-400 mb-4">Crop feature coming soon</p>
              <div className="flex justify-center gap-4">
                <button className="px-4 py-2 bg-gray-700 rounded-lg">1:1</button>
                <button className="px-4 py-2 bg-gray-700 rounded-lg">4:5</button>
                <button className="px-4 py-2 bg-gray-700 rounded-lg">16:9</button>
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-4">
              <button
                onClick={addTextOverlay}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Text
              </button>
              
              {textOverlays.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Text Overlays</h3>
                  {textOverlays.map((textOverlay) => (
                    <div key={textOverlay.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                      <span className="flex-1 text-sm truncate">{textOverlay.text}</span>
                      <button
                        onClick={() => setTextOverlays(prev => prev.filter(t => t.id !== textOverlay.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}