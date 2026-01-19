import React from 'react'
import { Plus, Hourglass } from 'lucide-react'

interface TimeCapsuleHeaderProps {
  onAddClick: () => void
}

export const TimeCapsuleHeader = ({ onAddClick }: TimeCapsuleHeaderProps) => {
  return (
    <section className="mb-12">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-[2.5rem] overflow-hidden relative min-h-[350px] shadow-2xl flex flex-col items-center justify-center text-center px-6">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-20 w-2 h-2 bg-white rounded-full animate-pulse" />
          <div className="absolute top-32 left-40 w-1 h-1 bg-white rounded-full animate-pulse delay-100" />
          <div className="absolute top-20 right-32 w-2 h-2 bg-white rounded-full animate-pulse delay-200" />
          <div className="absolute bottom-20 left-32 w-2 h-2 bg-white rounded-full animate-pulse delay-500" />
        </div>
        
        <div className="relative z-10 py-8">
          <div className="mb-6 animate-float inline-block">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-amber-300/50 shadow-lg shadow-amber-500/20">
              <Hourglass className="text-amber-300" size={40} />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-sm">
            Zaman Kapsülü 💌
          </h1>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Geleceğe mektuplar yazın, belirlediğiniz tarihte açılsın. <br className="hidden md:block" /> Bugünün duygularını yarının hatırasına dönüştürün.
          </p>
          
          <button 
            onClick={onAddClick}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-5 rounded-full font-black text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto group active:scale-95 shadow-xl shadow-orange-500/20"
          >
            <Plus className="group-hover:rotate-90 transition-transform duration-300" size={24} />
            <span>Yeni Kapsül Oluştur</span>
          </button>
        </div>
      </div>
    </section>
  )
}
