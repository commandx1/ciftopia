'use client'

import React, { useRef, useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  className?: string
  poster?: string
}

export const VideoPlayer = ({ src, className, poster }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isEnded, setIsEnded] = useState(false)

  // Controls visibility timeout
  let controlsTimeout: NodeJS.Timeout

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        if (isEnded) {
          videoRef.current.currentTime = 0
          setIsEnded(false)
        }
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
      videoRef.current.muted = val === 0
      setIsMuted(val === 0)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    clearTimeout(controlsTimeout)
    controlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setIsEnded(true)
    setShowControls(true)
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden bg-black rounded-3xl transition-all duration-500 shadow-2xl border-4 border-white/10 hover:border-white/20",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onClick={togglePlay}
        playsInline
      />

      {/* Overlay for Play/Replay state */}
      <div 
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 pointer-events-none",
          (isPlaying && !showControls) ? "opacity-0" : "opacity-100"
        )}
      >
        {!isPlaying && !isEnded && (
          <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-2xl scale-110 group-hover:scale-125 transition-transform duration-300 pointer-events-auto cursor-pointer" onClick={togglePlay}>
            <Play className="text-white ml-1" size={32} fill="currentColor" />
          </div>
        )}
        {isEnded && (
          <div className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center shadow-2xl scale-110 group-hover:scale-125 transition-transform duration-300 pointer-events-auto cursor-pointer" onClick={togglePlay}>
            <RefreshCw className="text-white" size={32} />
          </div>
        )}
      </div>

      {/* Custom Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-transform duration-500 translate-y-0",
          (!showControls && isPlaying) && "translate-y-full"
        )}
      >
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-6 group/progress cursor-pointer overflow-hidden">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-transform scale-0 group-hover/progress:scale-100"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={togglePlay}
              className="text-white hover:text-rose-400 transition-colors focus:outline-none"
            >
              {isEnded ? <RefreshCw size={24} /> : (isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />)}
            </button>

            <div className="flex items-center space-x-2 text-white/90 text-sm font-black tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40">/</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center space-x-3 group/volume">
              <button 
                onClick={toggleMute}
                className="text-white hover:text-rose-400 transition-colors focus:outline-none"
              >
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-rose-500"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={toggleFullscreen}
            className="text-white hover:text-rose-400 transition-colors focus:outline-none"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 0;
          height: 0;
        }
        input[type='range']::-moz-range-thumb {
          width: 0;
          height: 0;
          border: 0;
        }
      `}</style>
    </div>
  )
}
