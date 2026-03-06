'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'

const SLIDE_WIDTH = 280

export function QuizPhoneWithDots({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startScrollLeft: 0 })

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / SLIDE_WIDTH)
    setActiveIndex(Math.min(2, Math.max(0, index)))
  }, [])

  const animateTo = useCallback((targetScroll: number) => {
    const el = scrollRef.current
    if (!el) return
    const start = el.scrollLeft
    const distance = targetScroll - start
    const duration = 300
    const startTime = performance.now()
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      el.scrollLeft = start + distance * easeOut(t)
      handleScroll()
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [handleScroll])

  const snapToNearest = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / SLIDE_WIDTH)
    const clamped = Math.min(2, Math.max(0, index))
    animateTo(clamped * SLIDE_WIDTH)
  }, [animateTo])

  useEffect(() => {
    if (!isDragging) return
    const el = scrollRef.current

    const onMouseMove = (e: MouseEvent) => {
      if (!el) return
      const dx = dragRef.current.startX - e.clientX
      el.scrollLeft = dragRef.current.startScrollLeft + dx
    }

    const onMouseUp = () => {
      setIsDragging(false)
      snapToNearest()
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, snapToNearest])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const el = scrollRef.current
    if (!el) return
    dragRef.current = { startX: e.clientX, startScrollLeft: el.scrollLeft }
    setIsDragging(true)
  }, [])

  return (
    <>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseLeave={() => isDragging && setIsDragging(false)}
        className={`flex overflow-x-auto overflow-y-hidden w-full max-w-[380px] min-w-0 h-[660px] [&::-webkit-scrollbar]:hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: isDragging ? 'none' : 'x mandatory' }}
      >
        {children}
      </div>
      <div className='flex justify-center gap-1.5 py-2 bg-gray-100/80 border-t border-gray-200'>
        <span className='text-[10px] text-gray-400'>← Kaydır</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIndex ? 'bg-rose-400' : 'bg-gray-300'}`}
            title={i === 0 ? 'Lobby' : i === 1 ? 'Sorular' : 'Sonuç'}
          />
        ))}
      </div>
    </>
  )
}
