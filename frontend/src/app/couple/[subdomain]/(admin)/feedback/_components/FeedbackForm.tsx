'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { feedbackService } from '@/services/api';
import { useParams } from 'next/navigation';
import { User } from '@/lib/type';
import { showCustomToast } from '@/components/ui/CustomToast'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const feedbackSchema = z.object({
  subdomain: z.string().min(1, 'Subdomain zorunludur'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  partner1: z.string().min(1, 'Partner 1 ismi zorunludur'),
  partner2: z.string().min(1, 'Partner 2 ismi zorunludur'),
  rating: z.string().min(1, 'Puanlama zorunludur'),
  features: z.array(z.string()).min(1, 'En az bir özellik seçmelisiniz'),
  liked_features: z.string().min(5, 'Lütfen beğendiğiniz özellikleri detaylandırın'),
  improvements: z.string().min(5, 'Lütfen iyileştirilmesi gereken alanları detaylandırın'),
  bugs: z.string().optional(),
  feature_requests: z.string().optional(),
  device: z.string().min(1, 'Cihaz seçimi zorunludur'),
  frequency: z.string().min(1, 'Kullanım sıklığı seçimi zorunludur'),
  ease_of_use: z.string(),
  design: z.string(),
  performance: z.string(),
  recommend: z.string().min(1, 'Tavsiye seçimi zorunludur'),
  would_pay: z.string().min(1, 'Ödeme düşüncesi zorunludur'),
  price_range: z.string().optional(),
  additional_comments: z.string().optional(),
  consent: z.boolean().refine(val => val === true, 'Devam etmek için kabul etmelisiniz'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FEATURES = [
  { id: 'memories', label: 'Anılar' },
  { id: 'gallery', label: 'Galeri' },
  { id: 'daily-question', label: 'Günlük Sorular' },
  { id: 'poems', label: 'Şiirler' },
  { id: 'notes', label: 'Notlar' },
  { id: 'bucket-list', label: 'Bucket List' },
  { id: 'important-dates', label: 'Önemli Günler' },
  { id: 'time-capsule', label: 'Zaman Kapsülü' },
  { id: 'activities', label: 'Aktiviteler' },
  { id: 'other', label: 'Diğer' },
];

export default function FeedbackForm({ user }: { user: User | null }) {
  const { subdomain } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [easeValue, setEaseValue] = useState(5);
  const [designValue, setDesignValue] = useState(5);
  const [perfValue, setPerfValue] = useState(5);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      subdomain: user?.coupleId?.subdomain || subdomain as string,
      email: user?.email || '',
      partner1: user?.coupleId?.partner1?.firstName || '',
      partner2: user?.coupleId?.partner2?.firstName || '',
      features: [],
      ease_of_use: "5",
      design: "5",
      performance: "5",
      consent: false,
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      await feedbackService.create({
        ...data,
        rating: parseInt(data.rating),
        ease_of_use: parseInt(data.ease_of_use),
        design: parseInt(data.design),
        performance: parseInt(data.performance),
      });
      showCustomToast.success('Başarılı', 'Feedback&apos;iniz başarıyla gönderildi! Teşekkür ederiz. 💕');
      reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      showCustomToast.error('Hata', 'Feedback gönderilirken bir hata oluştu.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback-form-section" className="py-24 bg-gradient-to-b from-cream-white to-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Feedback Formu</h2>
          <p className="text-lg text-gray-600">Lütfen aşağıdaki formu doldurarak deneyimlerinizi bizimle paylaşın.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 space-y-12">
          {/* Section 1: Couple Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border-l-4 border-rose-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">👤</span>
                Çift Bilgileri
              </h3>
              <p className="text-gray-600 text-sm">Bu bilgiler hesabınızdan otomatik olarak alınmıştır.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subdomain Adınız</label>
                <input
                  {...register('subdomain')}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta Adresiniz</label>
                <input
                  {...register('email')}
                  readOnly
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Partner 1 İsim</label>
                <input
                  {...register('partner1')}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Partner 2 İsim</label>
                <input
                  {...register('partner2')}
                  readOnly
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Section 2: General Evaluation */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-l-4 border-purple-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">⭐</span>
                Genel Değerlendirme
              </h3>
              <p className="text-gray-600 text-sm">Çiftopia deneyiminizi değerlendirin</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Genel Memnuniyet Puanı *</label>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-4">
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-2"
                    >
                      {[1, 2, 3, 4, 5].map((val) => (
                        <label key={val} className="cursor-pointer group flex items-center justify-center">
                          <RadioGroupItem value={val.toString()} className="hidden" />
                          <span className={`text-3xl transition-all duration-200 transform group-hover:scale-110 ${
                            field.value && parseInt(field.value) >= val 
                              ? 'text-yellow-400 fill-yellow-400' 
                              : 'text-gray-200 group-hover:text-yellow-200'
                          }`}>
                            ★
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                    <span className="text-gray-500 text-sm font-medium">
                      {field.value ? `${field.value} / 5` : '(1: Çok Kötü - 5: Mükemmel)'}
                    </span>
                  </div>
                )}
              />
              {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">En Çok Kullandığınız Özellikler *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FEATURES.map((feature) => (
                  <Controller
                    key={feature.id}
                    name="features"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100">
                        <Checkbox
                          checked={field.value?.includes(feature.id)}
                          onCheckedChange={(checked) => {
                            const updatedValue = checked
                              ? [...(field.value || []), feature.id]
                              : field.value?.filter((value: string) => value !== feature.id);
                            field.onChange(updatedValue);
                          }}
                        />
                        <span className="text-sm text-gray-700 font-medium">{feature.label}</span>
                      </label>
                    )}
                  />
                ))}
              </div>
              {errors.features && <p className="text-red-500 text-xs mt-1">{errors.features.message}</p>}
            </div>
          </div>
          
          {/* Section 3: Detailed Feedback */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-l-4 border-blue-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">💬</span>
                Detaylı Feedback
              </h3>
              <p className="text-gray-600 text-sm">Deneyimlerinizi ve önerilerinizi paylaşın</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">En Çok Beğendiğiniz Özellikler *</label>
                <textarea
                  {...register('liked_features')}
                  rows={4}
                  placeholder="Hangi özellikleri çok beğendiniz ve neden?"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.liked_features ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:outline-none transition-all resize-none`}
                />
                {errors.liked_features && <p className="text-red-500 text-xs mt-1">{errors.liked_features.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">İyileştirilmesi Gereken Alanlar *</label>
                <textarea
                  {...register('improvements')}
                  rows={4}
                  placeholder="Hangi özelliklerin geliştirilmesi gerektiğini düşünüyorsunuz?"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.improvements ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:outline-none transition-all resize-none`}
                />
                {errors.improvements && <p className="text-red-500 text-xs mt-1">{errors.improvements.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Karşılaştığınız Hatalar / Sorunlar</label>
                <textarea
                  {...register('bugs')}
                  rows={4}
                  placeholder="Teknik hatalar, çalışmayan özellikler veya kullanım sorunları (varsa)"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Yeni Özellik Önerileri</label>
                <textarea
                  {...register('feature_requests')}
                  rows={4}
                  placeholder="Platformda görmek istediğiniz yeni özellikler neler?"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
          
          {/* Section 4: Usage Experience */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">📱</span>
                Kullanım Deneyimi
              </h3>
              <p className="text-gray-600 text-sm">Platformu nasıl kullanıyorsunuz?</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">En Çok Hangi Cihazdan Kullanıyorsunuz? *</label>
              <Controller
                name="device"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {['mobile', 'tablet', 'desktop'].map((dev) => (
                      <label 
                        key={dev} 
                        className={`flex items-center space-x-3 rounded-xl p-4 cursor-pointer transition-all border-2 ${
                          field.value === dev 
                            ? 'bg-green-50 border-green-300 shadow-sm' 
                            : 'bg-gray-50 border-transparent hover:border-green-200'
                        }`}
                      >
                        <RadioGroupItem value={dev} className="border-green-500 text-green-500 data-[state=checked]:bg-green-500" />
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">
                            {dev === 'mobile' ? '📱' : dev === 'tablet' ? '📟' : '💻'}
                          </span>
                          <p className="font-semibold text-gray-800 capitalize">
                            {dev === 'mobile' ? 'Mobil' : dev === 'tablet' ? 'Tablet' : 'Masaüstü'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.device && <p className="text-red-500 text-xs mt-1">{errors.device.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Ne Sıklıkla Kullanıyorsunuz? *</label>
              <select
                {...register('frequency')}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.frequency ? 'border-red-300' : 'border-gray-200'} focus:border-green-500 focus:outline-none transition-all`}
              >
                <option value="">Seçiniz...</option>
                <option value="daily">Her gün</option>
                <option value="few-times-week">Haftada birkaç kez</option>
                <option value="weekly">Haftada bir</option>
                <option value="few-times-month">Ayda birkaç kez</option>
                <option value="rarely">Nadiren</option>
              </select>
              {errors.frequency && <p className="text-red-500 text-xs mt-1">{errors.frequency.message}</p>}
            </div>
            
            <div className="space-y-6">
              <label className="block text-sm font-semibold text-gray-700">Kullanıcı Arayüzü Değerlendirmesi *</label>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Kullanım Kolaylığı</span>
                    <span className="text-sm font-semibold text-gray-800">{easeValue}</span>
                  </div>
                  <input
                    type="range"
                    {...register('ease_of_use')}
                    min="1"
                    max="10"
                    onChange={(e) => setEaseValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Tasarım / Görsellik</span>
                    <span className="text-sm font-semibold text-gray-800">{designValue}</span>
                  </div>
                  <input
                    type="range"
                    {...register('design')}
                    min="1"
                    max="10"
                    onChange={(e) => setDesignValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Performans / Hız</span>
                    <span className="text-sm font-semibold text-gray-800">{perfValue}</span>
                  </div>
                  <input
                    type="range"
                    {...register('performance')}
                    min="1"
                    max="10"
                    onChange={(e) => setPerfValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 5: Last Questions */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-l-4 border-amber-500">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-3">❤️</span>
                Son Sorular
              </h3>
              <p className="text-gray-600 text-sm">Birkaç soru daha...</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Çiftopia&apos;yı Bir Arkadaşınıza Tavsiye Eder misiniz? *</label>
              <Controller
                name="recommend"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {[
                      { val: 'no', label: 'Hayır', icon: '❌', bg: 'bg-red-50', border: 'border-red-300', accent: 'border-red-500 text-red-500 data-[state=checked]:bg-red-500' },
                      { val: 'maybe', label: 'Belki', icon: '🤔', bg: 'bg-yellow-50', border: 'border-yellow-300', accent: 'border-yellow-500 text-yellow-500 data-[state=checked]:bg-yellow-500' },
                      { val: 'yes', label: 'Evet', icon: '✅', bg: 'bg-green-50', border: 'border-green-300', accent: 'border-green-500 text-green-500 data-[state=checked]:bg-green-500' }
                    ].map((item) => (
                      <label 
                        key={item.val} 
                        className={`flex items-center space-x-3 rounded-xl p-4 cursor-pointer transition-all border-2 ${
                          field.value === item.val 
                            ? `${item.bg} ${item.border} shadow-sm` 
                            : 'bg-gray-50 border-transparent hover:border-gray-200'
                        }`}
                      >
                        <RadioGroupItem value={item.val} className={item.accent} />
                        <span className="font-semibold text-gray-800">{item.icon} {item.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.recommend && <p className="text-red-500 text-xs mt-1">{errors.recommend.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ödeme Yapmayı Düşünür müsünüz? *</label>
                <select
                  {...register('would_pay')}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${errors.would_pay ? 'border-red-300' : 'border-gray-200'} focus:border-amber-500 focus:outline-none transition-all`}
                >
                  <option value="">Seçiniz...</option>
                  <option value="definitely">Kesinlikle evet</option>
                  <option value="probably">Muhtemelen evet</option>
                  <option value="maybe">Belki</option>
                  <option value="probably-not">Muhtemelen hayır</option>
                  <option value="no">Hayır</option>
                </select>
                {errors.would_pay && <p className="text-red-500 text-xs mt-1">{errors.would_pay.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Uygun Fiyat Aralığı (Aylık)</label>
                <select
                  {...register('price_range')}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-all"
                >
                  <option value="">Seçiniz...</option>
                  <option value="0-25">₺0 - ₺25</option>
                  <option value="25-50">₺25 - ₺50</option>
                  <option value="50-100">₺50 - ₺100</option>
                  <option value="100+">₺100+</option>
                  <option value="free">Sadece ücretsiz kullanırım</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ek Yorumlar</label>
              <textarea
                {...register('additional_comments')}
                rows={4}
                placeholder="Eklemek istediğiniz başka bir şey var mı?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
          
          {/* Consent and Submit */}
          <div className="space-y-6 pt-6">
            <Controller
              name="consent"
              control={control}
              render={({ field }) => (
                <div className="flex items-start space-x-3 bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                  <Checkbox
                    id="consent"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
                    Feedback&apos;imin ürün geliştirme sürecinde kullanılmasını ve gerekirse benimle iletişime geçilmesini kabul ediyorum. *
                  </label>
                </div>
              )}
            />
            {errors.consent && <p className="text-red-500 text-xs mt-1">{errors.consent.message}</p>}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-rose-500 to-coral-warm text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </span>
                ) : (
                  <>
                    <span className="mr-3 group-hover:translate-x-1 transition-transform">🚀</span>
                    Feedback&apos;i Gönder
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="bg-gray-200 text-gray-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-300 transition-all"
              >
                Formu Temizle
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
