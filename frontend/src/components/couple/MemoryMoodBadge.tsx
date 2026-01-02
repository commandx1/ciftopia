import React from 'react'
import { Heart, Smile, Frown, Mountain, Clock, LucideIcon } from 'lucide-react'

export type MoodType = 'romantic' | 'fun' | 'emotional' | 'adventure' | string

interface MoodConfig {
  label: string
  colorClass: string
  icon: LucideIcon
  bgGradient: string
  iconColor: string
  cardBg: string
}

export const moodConfigs: Record<string, MoodConfig> = {
  romantic: {
    label: 'Romantik',
    colorClass: 'bg-rose-50 text-rose-600',
    icon: Heart,
    bgGradient: 'from-rose-500 to-coral-warm',
    iconColor: 'text-rose-500',
    cardBg: 'bg-rose-50'
  },
  fun: {
    label: 'Eğlenceli',
    colorClass: 'bg-amber-50 text-amber-600',
    icon: Smile,
    bgGradient: 'from-amber-400 to-orange-500',
    iconColor: 'text-amber-500',
    cardBg: 'bg-amber-50'
  },
  emotional: {
    label: 'Duygusal',
    colorClass: 'bg-blue-50 text-blue-600',
    icon: Frown,
    bgGradient: 'from-blue-500 to-indigo-500',
    iconColor: 'text-blue-500',
    cardBg: 'bg-blue-50'
  },
  adventure: {
    label: 'Macera',
    colorClass: 'bg-green-50 text-green-600',
    icon: Mountain,
    bgGradient: 'from-green-500 to-emerald-500',
    iconColor: 'text-green-500',
    cardBg: 'bg-green-50'
  }
}

const defaultConfig: MoodConfig = {
  label: 'Anı',
  colorClass: 'bg-gray-50 text-gray-600',
  icon: Clock,
  bgGradient: 'from-gray-400 to-gray-500',
  iconColor: 'text-gray-400',
  cardBg: 'bg-white'
}

interface MemoryMoodBadgeProps {
  mood: MoodType
  className?: string
  showIcon?: boolean
}

export const MemoryMoodBadge: React.FC<MemoryMoodBadgeProps> = ({ mood, className = '', showIcon = true }) => {
  const config = moodConfigs[mood] || defaultConfig
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${config.colorClass} ${className}`}>
      {showIcon && <Icon className="inline mr-1.5" size={14} fill={mood === 'romantic' ? 'currentColor' : 'none'} />}
      {config.label}
    </span>
  )
}

interface MemoryMoodIconProps {
  mood: MoodType
  className?: string
  size?: number
}

export const MemoryMoodIcon: React.FC<MemoryMoodIconProps> = ({ mood, className = '', size = 20 }) => {
  const config = moodConfigs[mood] || defaultConfig
  const Icon = config.icon

  return (
    <div className={`w-12 h-12 bg-gradient-to-br ${config.bgGradient} rounded-full flex items-center justify-center shadow-lg z-20 ${className}`}>
      <Icon className="text-white" size={size} fill={mood === 'romantic' ? 'white' : 'none'} />
    </div>
  )
}

