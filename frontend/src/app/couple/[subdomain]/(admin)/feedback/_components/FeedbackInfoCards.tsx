import React from 'react';

export default function FeedbackInfoCards() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border-2 border-rose-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-2xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Kurucu Çift Avantajları</h3>
            <ul className="text-left space-y-3 text-gray-700 w-full">
              <li className="flex items-start">
                <span className="text-rose-500 mr-2">✓</span>
                <span>Lifetime üyelik (₺1,499 değerinde)</span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-500 mr-2">✓</span>
                <span>Öncelikli teknik destek</span>
              </li>
              <li className="flex items-start">
                <span className="text-rose-500 mr-2">✓</span>
                <span>Yeni özelliklere erken erişim</span>
              </li>
            </ul>
          </div>
          
          {/* Card 2 */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border-2 border-purple-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-2xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Beklentilerimiz</h3>
            <ul className="text-left space-y-3 text-gray-700 w-full">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Tüm özellikleri aktif olarak test edin</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Haftada en az 1 feedback gönderin</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Hataları detaylı raporlayın</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>İyileştirme önerileri paylaşın</span>
              </li>
            </ul>
          </div>
          
          {/* Card 3 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-2xl">📅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Program Süresi</h3>
            <div className="space-y-4 w-full">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-50">
                <p className="font-bold text-blue-600">Beta Dönemi</p>
                <p className="text-sm text-gray-600">3 ay aktif test</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-50">
                <p className="font-bold text-blue-600">Feedback Sıklığı</p>
                <p className="text-sm text-gray-600">Haftada minimum 1</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-50">
                <p className="font-bold text-blue-600">Sonrası</p>
                <p className="text-sm text-gray-600">Lifetime üyelik devam eder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
