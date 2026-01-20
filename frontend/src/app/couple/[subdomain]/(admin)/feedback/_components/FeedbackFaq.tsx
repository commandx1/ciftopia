import React from 'react';

const faqs = [
  {
    id: 1,
    question: 'Ne kadar sıklıkla feedback vermem gerekiyor?',
    answer: 'Haftada minimum 1 feedback bekliyoruz. Ancak daha fazla feedback vermeniz ürünün gelişimi için çok değerli!',
    color: 'rose'
  },
  {
    id: 2,
    question: 'Feedback vermediğim takdirde ne olur?',
    answer: 'Aktif feedback vermeyen kullanıcıların Lifetime üyeliği sonlandırılabilir. Ancak size hatırlatmalar göndereceğiz.',
    color: 'purple'
  },
  {
    id: 3,
    question: 'Beta dönemi sonrası üyeliğim devam eder mi?',
    answer: 'Evet! Beta dönemini başarıyla tamamlayan tüm kurucu çiftlerin Lifetime üyeliği sonsuza kadar devam eder.',
    color: 'blue'
  },
  {
    id: 4,
    question: 'Verdiğim feedback\'ler anonim mi?',
    answer: 'Hayır, sizinle iletişime geçebilmemiz için isminiz ve e-postanız gerekli. Ancak feedback\'leriniz sadece geliştirme ekibi tarafından görülür.',
    color: 'green'
  }
];

export default function FeedbackFaq() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h2>
          <p className="text-lg text-gray-600">Kurucu Çift Programı hakkında merak edilenler</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq) => {
            const colorClass = {
              rose: 'from-rose-50 to-pink-50 border-rose-100',
              purple: 'from-purple-50 to-indigo-50 border-purple-100',
              blue: 'from-blue-50 to-cyan-50 border-blue-100',
              green: 'from-green-50 to-emerald-50 border-green-100'
            }[faq.color];

            const iconColor = {
              rose: 'text-rose-500',
              purple: 'text-purple-500',
              blue: 'text-blue-500',
              green: 'text-green-500'
            }[faq.color];

            return (
              <div key={faq.id} className={`bg-gradient-to-br ${colorClass} rounded-2xl p-6 border-2 transition-all hover:shadow-md`}>
                <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center">
                  <span className={`${iconColor} mr-3 text-xl`}>❓</span>
                  {faq.question}
                </h4>
                <p className="text-gray-600 ml-9 leading-relaxed">{faq.answer}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
