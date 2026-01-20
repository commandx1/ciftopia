'use client';

import React, { useEffect, useState } from 'react';
import { feedbackService } from '@/services/api';

export default function FeedbackStats() {
  const [stats, setStats] = useState({ totalFeedback: 0, limit: 50, registered: 23 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await feedbackService.getStats();
        setStats(prev => ({ ...prev, totalFeedback: res.data.totalFeedback }));
      } catch (e) {
        console.error('Stats loading error:', e);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-cream-white to-rose-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-rose-50 transition-transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-rose-500 mb-2">{stats.limit}</div>
            <div className="text-gray-600 font-medium">Kurucu Çift Kotası</div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-50 transition-transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-purple-500 mb-2">{stats.registered}</div>
            <div className="text-gray-600 font-medium">Kayıtlı Çift</div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-50 transition-transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-blue-500 mb-2">{stats.limit - stats.registered}</div>
            <div className="text-gray-600 font-medium">Kalan Kota</div>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-50 transition-transform hover:-translate-y-1">
            <div className="text-4xl font-bold text-green-500 mb-2">{stats.totalFeedback}</div>
            <div className="text-gray-600 font-medium">Toplam Feedback</div>
          </div>
        </div>
      </div>
    </section>
  );
}
