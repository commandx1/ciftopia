"use client";

import React, { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, Lock, User, ArrowRight, ArrowLeft, Globe, CreditCard, Loader2, 
  Link as LinkIcon, Info, CheckCircle2, Check, Heart, Calendar, Users, 
  UserPlus, HeartPulse, ShieldCheck, CheckCircle, Rocket, RotateCcw, Headset 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { authService, onboardingService, paymentService } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  
  const plans = [
    {
      id: 'monthly',
      name: 'Aylık Plan',
      setupFee: 249,
      subscriptionFee: 49,
      total: 298,
      period: 'Aylık',
      description: 'Tüm premium özellikler dahil',
      color: 'rose'
    },
    {
      id: 'yearly',
      name: 'Yıllık Plan',
      setupFee: 249,
      subscriptionFee: 349,
      total: 598,
      period: 'Yıllık',
      description: 'En popüler seçenek - Tasarruflu',
      color: 'purple'
    },
    {
      id: 'lifetime',
      name: 'Ömür Boyu',
      setupFee: 249,
      subscriptionFee: 1050,
      total: 1299,
      period: 'Tek Seferlik',
      description: 'Sonsuza kadar sizin olsun',
      color: 'amber'
    }
  ];

  const [selectedPlanId, setSelectedPlanId] = useState('monthly');
  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  
  // Registration State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    partnerFirstName: "",
    partnerLastName: "",
    partnerEmail: "",
    partnerPassword: "",
    partnerPasswordConfirm: "",
    relationshipStartDate: "",
    relationshipStatus: "dating",
    subdomain: "",
  });

  // Payment State
  const [paymentData, setPaymentState] = useState({
    cardHolderName: "",
    cardNumber: "",
    expireDate: "", // Added for UI control
    expireMonth: "",
    expireYear: "",
    cvc: "",
    differentBilling: false,
    billingAddress: "",
    billingCity: "",
    billingZip: "",
  });

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "subdomain") {
      const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
      setIsSubdomainAvailable(null);
    } else if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name in paymentData || name === "differentBilling") {
      const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      
      if (name === "cardNumber") {
        const formatted = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
        setPaymentState(prev => ({ ...prev, [name]: formatted }));
      } else if (name === "expireDate") {
        let formatted = value.replace(/\D/g, '').substring(0, 4);
        if (formatted.length >= 2) {
          formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
        }
        const [month, year] = formatted.split('/');
        setPaymentState(prev => ({ 
          ...prev, 
          expireDate: formatted, 
          expireMonth: month || "", 
          expireYear: year || "" 
        }));
      } else if (name === "cvc") {
        setPaymentState(prev => ({ ...prev, [name]: value.replace(/\D/g, '').substring(0, 4) }));
      } else if (name === "cardHolderName") {
        setPaymentState(prev => ({ ...prev, [name]: value.toUpperCase() }));
      } else {
        setPaymentState(prev => ({ ...prev, [name]: val }));
      }
    }
    setError("");
  };

  const handleStatusChange = (status: string) => {
    setFormData(prev => ({ ...prev, relationshipStatus: status }));
  };

  const handleStep1 = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Kayıt sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!formData.subdomain || formData.subdomain.length < 3) {
      setError("Subdomain en az 3 karakter olmalıdır.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await onboardingService.checkSubdomain(formData.subdomain);
      if (data.data.available) {
        setIsSubdomainAvailable(true);
        setStep(3);
      } else {
        setIsSubdomainAvailable(false);
        setError("Bu adres zaten alınmış, lütfen başka bir tane deneyin.");
      }
    } catch (err) {
      setError("Adres kontrolü sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = () => {
    if (!formData.partnerFirstName || !formData.partnerLastName || !formData.partnerEmail || !formData.partnerPassword) {
      setError("Lütfen partnerinizin tüm bilgilerini doldurun.");
      return;
    }
    if (formData.partnerPassword !== formData.partnerPasswordConfirm) {
      setError("Şifreler eşleşmiyor!");
      return;
    }
    if (!formData.relationshipStartDate || !formData.relationshipStatus) {
      setError("Lütfen ilişki bilgilerinizi doldurun.");
      return;
    }
    setStep(4);
  };

  const handleFinalStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.cardHolderName || paymentData.cardNumber.length < 15 || !paymentData.expireMonth || !paymentData.expireYear || paymentData.cvc.length < 3) {
      setError("Lütfen geçerli ödeme bilgilerini girin.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Process Payment First
      const paymentResponse = await paymentService.processPayment({
        cardHolderName: paymentData.cardHolderName,
        cardNumber: paymentData.cardNumber,
        expireMonth: paymentData.expireMonth,
        expireYear: paymentData.expireYear,
        cvc: paymentData.cvc,
        amount: selectedPlan.total,
        subdomain: formData.subdomain,
      });

      // 2. If Payment Successful, Create Couple Site
      await onboardingService.createCouple({
        subdomain: formData.subdomain,
        partnerFirstName: formData.partnerFirstName,
        partnerLastName: formData.partnerLastName,
        partnerEmail: formData.partnerEmail,
        partnerPassword: formData.partnerPassword,
        relationshipStartDate: formData.relationshipStartDate || undefined,
        relationshipStatus: formData.relationshipStatus,
        paymentTransactionId: paymentResponse.data.paymentId, // Pass the transaction ID
      });

      // Redirect to dashboard (app.ciftopia.com)
      window.location.href = process.env.NEXT_PUBLIC_APP_URL || '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.message || "Ödeme veya kurulum sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = [
    "Hesabınızı Oluşturun",
    "Sitenizin Adresini Seçin 🌐",
    "Partnerinizi Ekleyin 💑",
    "Ödemeyi Tamamlayın 💳"
  ];

  const mainDomain = typeof window !== 'undefined' ? (window.location.hostname.replace('app.', '') || 'ciftopia.com') : 'ciftopia.com';

  const renderProgressIndicator = () => {
    const steps = [
      { id: 1, label: "Hesap" },
      { id: 2, label: "Subdomain" },
      { id: 3, label: "Partner" },
      { id: 4, label: "Ödeme" },
    ];

    return (
      <div id="progress-indicator" className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-800 -z-10"></div>
          <div 
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-rose-primary to-pink-400 transition-all duration-500 -z-10" 
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center relative">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg mb-2 transition-all duration-500",
                s.id < step ? "bg-gradient-to-br from-green-500 to-green-600" :
                s.id === step ? "bg-gradient-to-br from-rose-primary to-pink-400 scale-110" :
                "bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-gray-400"
              )}>
                {s.id < step ? <Check size={18} strokeWidth={3} /> : s.id}
              </div>
              <span className={cn(
                "text-xs font-semibold transition-colors duration-500",
                s.id < step ? "text-green-600 dark:text-green-400" :
                s.id === step ? "text-rose-primary" :
                "text-gray-400 dark:text-gray-500"
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getCardTypeIcon = () => {
    const number = paymentData.cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />;
    if (number.startsWith('5')) return <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />;
    return <CreditCard className="text-gray-300" size={24} />;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Adınız</label>
                <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Ad" className="py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Soyadınız</label>
                <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Soyad" className="py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">E-posta Adresi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ornek@email.com" className="pl-12 py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="pl-12 py-7 bg-soft-gray dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-rose-primary text-lg" />
              </div>
            </div>
            {error && <p className="text-rose-500 text-sm font-bold ml-1">{error}</p>}
            <Button onClick={handleStep1} disabled={isLoading} className="w-full bg-rose-primary hover:bg-rose-600 text-white py-8 rounded-2xl font-bold text-xl transition-all border-none group">
              {isLoading ? <Loader2 className="animate-spin" /> : <>Devam Et <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" /></>}
            </Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500 max-w-md mx-auto">
            <div className="space-y-2">
              <label htmlFor="subdomain" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Subdomain Seçin</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  id="subdomain"
                  name="subdomain" 
                  value={formData.subdomain} 
                  onChange={handleInputChange} 
                  placeholder="ornek: ahmet-ayse" 
                  className="pl-12 pr-4 py-7 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus-visible:ring-rose-primary text-lg lowercase outline-none focus:border-rose-primary" 
                />
              </div>
              
              <div className={cn(
                "mt-4 p-4 rounded-xl border-2 transition-all",
                isSubdomainAvailable === true ? "bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-900/30" :
                isSubdomainAvailable === false ? "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-900/30" :
                "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-transparent"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                      <LinkIcon className="text-gray-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Sitenizin Adresi:</p>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">
                        {formData.subdomain || "subdomain"}.{mainDomain}
                      </p>
                    </div>
                  </div>
                  {isSubdomainAvailable === true && <CheckCircle2 className="text-green-500" size={24} />}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-5 border-l-4 border-blue-400">
              <div className="flex items-start space-x-3">
                <Info className="text-blue-500 mt-1 shrink-0" size={20} />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Subdomain Kuralları:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 mt-0.5 shrink-0" size={12} strokeWidth={3} />
                      <span>Sadece küçük harf (a-z) ve tire (-) kullanılabilir</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 mt-0.5 shrink-0" size={12} strokeWidth={3} />
                      <span>Minimum 3, maksimum 30 karakter olmalıdır</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-green-500 mr-2 mt-0.5 shrink-0" size={12} strokeWidth={3} />
                      <span>Sonradan dashboard&apos;dan değiştirilebilir</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {error && <p className="text-rose-500 text-sm font-bold ml-1">{error}</p>}

            <div className="flex items-center space-x-4 pt-4">
              <button onClick={() => setStep(1)} type="button" className="text-gray-600 dark:text-gray-400 font-semibold hover:text-rose-primary transition-colors flex items-center space-x-2 px-4">
                <ArrowLeft size={20} />
                <span>Geri</span>
              </button>
              
              <Button onClick={handleStep2} disabled={isLoading} className="flex-1 bg-gradient-to-r from-rose-primary to-coral-warm text-white py-8 rounded-xl font-bold text-lg hover:shadow-xl transition-all border-none group">
                {isLoading ? <Loader2 className="animate-spin" /> : <>Devam Et <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </div>
          </div>
        );
      case 3:
        const statusOptions = [
          { id: 'dating', label: 'Sevgiliyiz', icon: <Heart size={20} /> },
          { id: 'engaged', label: 'Nişanlıyız', icon: <Users size={20} /> },
          { id: 'married', label: 'Evliyiz', icon: <CheckCircle2 size={20} /> },
        ];

        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500 w-full lg:max-w-4xl lg:-ml-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
              <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-primary to-pink-400 rounded-full flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900">
                  <Heart className="text-white w-8 h-8 fill-current" />
                </div>
              </div>

              {/* Your Info Card */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-3xl p-8 border-2 border-rose-100 dark:border-rose-900/30">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-primary to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">Sizin Bilgileriniz</h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Ad Soyad</label>
                    <div className="px-5 py-4 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl text-gray-600 dark:text-gray-300 font-semibold shadow-sm">
                      {formData.firstName} {formData.lastName}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-posta</label>
                    <div className="px-5 py-4 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl text-gray-600 dark:text-gray-300 font-semibold shadow-sm">
                      {formData.email}
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 border-2 border-green-100 dark:border-green-900/30 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <Check className="text-white w-5 h-5" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">Hesabınız Hazır!</span>
                  </div>
                </div>
              </div>

              {/* Partner Info Card */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-3xl p-8 border-2 border-purple-100 dark:border-purple-900/30">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <UserPlus className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">Partner Bilgileri</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Ad</label>
                      <Input name="partnerFirstName" value={formData.partnerFirstName} onChange={handleInputChange} placeholder="Ad" className="py-6 bg-white dark:bg-slate-800 border-none rounded-xl focus-visible:ring-purple-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Soyad</label>
                      <Input name="partnerLastName" value={formData.partnerLastName} onChange={handleInputChange} placeholder="Soyad" className="py-6 bg-white dark:bg-slate-800 border-none rounded-xl focus-visible:ring-purple-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-posta</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input name="partnerEmail" value={formData.partnerEmail} onChange={handleInputChange} placeholder="partner@email.com" className="pl-10 py-6 bg-white dark:bg-slate-800 border-none rounded-xl focus-visible:ring-purple-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Şifre</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input name="partnerPassword" type="password" value={formData.partnerPassword} onChange={handleInputChange} placeholder="••••••••" className="pl-10 py-6 bg-white dark:bg-slate-800 border-none rounded-xl focus-visible:ring-purple-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tekrar</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input name="partnerPasswordConfirm" type="password" value={formData.partnerPasswordConfirm} onChange={handleInputChange} placeholder="••••••••" className="pl-10 py-6 bg-white dark:bg-slate-800 border-none rounded-xl focus-visible:ring-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Relationship Info Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-3xl p-8 border-2 border-amber-100 dark:border-amber-900/30">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <HeartPulse className="text-white w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white">İlişki Bilgileri</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Tanışma Tarihiniz</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <Input name="relationshipStartDate" type="date" value={formData.relationshipStartDate} onChange={handleInputChange} className="pl-12 py-7 bg-white dark:bg-slate-800 border-none rounded-2xl focus-visible:ring-amber-500 text-lg shadow-sm" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-medium">Bu tarih anasayfanızda geri sayım için kullanılacak</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">İlişki Durumunuz</label>
                  <div className="grid grid-cols-3 gap-3">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleStatusChange(opt.id)}
                        type="button"
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1.5",
                          formData.relationshipStatus === opt.id 
                            ? "bg-white border-amber-500 text-amber-600 dark:bg-slate-800 shadow-md scale-105" 
                            : "bg-white/50 border-gray-100 text-gray-400 hover:border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          formData.relationshipStatus === opt.id ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-slate-700"
                        )}>
                          {opt.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border-l-4 border-blue-400 flex items-start space-x-4">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Partner Erişimi Hakkında:</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 font-medium">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500 w-3.5 h-3.5" />
                    <span>Partneriniz girdiğiniz email ve şifre ile giriş yapabilecek</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500 w-3.5 h-3.5" />
                    <span>Site oluşturulduktan sonra otomatik davet emaili gönderilecek</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500 w-3.5 h-3.5" />
                    <span>Şifreyi daha sonra dashboard&apos;dan değiştirebilirsiniz</span>
                  </li>
                </ul>
              </div>
            </div>

            {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}

            <div className="flex items-center space-x-6 pt-4">
              <button onClick={() => setStep(2)} type="button" className="text-gray-500 dark:text-gray-400 font-bold hover:text-rose-primary transition-colors flex items-center space-x-2 px-4 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Geri</span>
              </button>
              
              <Button onClick={handleStep3} className="flex-1 bg-gradient-to-r from-rose-primary to-coral-warm text-white py-8 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all border-none group">
                Devam Et <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-center items-center space-x-8 opacity-50 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold">SSL GÜVENLİ</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock size={18} />
                <span className="text-xs font-bold">256-BIT</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={18} />
                <span className="text-xs font-bold">KVKK UYUMLU</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-in fade-in slide-in-from-right duration-500 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div id="payment-form-container" className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ödeme Bilgileri</h2>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30">
                        <ShieldCheck className="text-green-600 dark:text-green-400" size={16} />
                        <span className="text-xs font-bold text-green-700 dark:text-green-300">256-bit SSL</span>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleFinalStep} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Kart Üzerindeki İsim *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input 
                          name="cardHolderName" 
                          value={paymentData.cardHolderName} 
                          onChange={handleInputChange} 
                          className="pl-12 py-7 border-2 border-gray-100 dark:border-slate-700 rounded-xl focus:border-rose-primary transition-all outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-bold uppercase" 
                          placeholder="AHMET YILMAZ" 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Kart Numarası *</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input 
                          name="cardNumber" 
                          value={paymentData.cardNumber} 
                          onChange={handleInputChange} 
                          maxLength={19} 
                          className="pl-12 pr-16 py-7 border-2 border-gray-100 dark:border-slate-700 rounded-xl focus:border-rose-primary transition-all outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono text-xl tracking-wider" 
                          placeholder="0000 0000 0000 0000" 
                          required 
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                          {getCardTypeIcon()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">Son Kullanma Tarihi *</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <Input 
                            name="expireDate" 
                            value={paymentData.expireDate} 
                            onChange={handleInputChange} 
                            maxLength={5} 
                            className="pl-12 py-7 border-2 border-gray-100 dark:border-slate-700 rounded-xl focus:border-rose-primary transition-all outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono text-xl" 
                            placeholder="AA/YY" 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">CVV *</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                          <Input 
                            name="cvc" 
                            value={paymentData.cvc} 
                            onChange={handleInputChange} 
                            maxLength={4} 
                            className="pl-12 py-7 border-2 border-gray-100 dark:border-slate-700 rounded-xl focus:border-rose-primary transition-all outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-mono text-xl" 
                            placeholder="•••" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <label className="flex items-start space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          name="differentBilling" 
                          checked={paymentData.differentBilling} 
                          onChange={handleInputChange} 
                          className="mt-1 w-5 h-5 text-rose-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-rose-100" 
                        />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-rose-primary transition-colors">Fatura adresim farklı</span>
                      </label>
                      
                      {paymentData.differentBilling && (
                        <div className="mt-4 p-6 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-gray-100 dark:border-slate-700 space-y-4 animate-in fade-in zoom-in duration-300">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Fatura Adresi</label>
                            <textarea 
                              name="billingAddress" 
                              value={paymentData.billingAddress} 
                              onChange={handleInputChange} 
                              rows={3} 
                              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-rose-primary transition-all outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none font-medium" 
                              placeholder="Adres bilgilerinizi girin"
                            ></textarea>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Şehir</label>
                              <Input name="billingCity" value={paymentData.billingCity} onChange={handleInputChange} className="py-6 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-rose-primary transition-all outline-none bg-white dark:bg-slate-800" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Posta Kodu</label>
                              <Input name="billingZip" value={paymentData.billingZip} onChange={handleInputChange} className="py-6 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-rose-primary transition-all outline-none bg-white dark:bg-slate-800" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                          <ShieldCheck className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-white mb-2">Güvenli Ödeme</h4>
                          <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="text-green-500 w-3.5 h-3.5" />
                              <span>Kart bilgileriniz iyzico güvencesiyle korunur</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="text-green-500 w-3.5 h-3.5" />
                              <span>256-bit SSL şifreleme ile maksimum güvenlik</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircle className="text-green-500 w-3.5 h-3.5" />
                              <span>PCI DSS Level 1 sertifikalı altyapı</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 pt-4">
                      <button type="button" onClick={() => setStep(3)} className="text-gray-500 dark:text-gray-400 font-bold hover:text-rose-primary transition-colors flex items-center space-x-2 px-4 group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Geri</span>
                      </button>
                      
                      <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-8 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all border-none group shadow-lg shadow-green-200 dark:shadow-none">
                        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (
                          <>
                            <Lock className="mr-3" size={20} />
                            ₺{selectedPlan.total} Öde ve Başla
                            <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {error && <p className="text-rose-500 text-sm font-bold text-center mt-4">{error}</p>}
                    
                    <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 font-medium px-8">
                      Ödeme yaparak <Link href="#" className="text-rose-primary hover:underline font-bold">kullanım şartlarını</Link> ve <Link href="#" className="text-rose-primary hover:underline font-bold">gizlilik politikasını</Link> kabul etmiş olursunuz
                    </p>
                  </form>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div id="order-summary" className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 sticky top-6 border border-gray-100 dark:border-slate-700">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Sipariş Özeti</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-2xl p-5 border-2 border-rose-100 dark:border-rose-900/30">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-primary to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-none">
                          <Globe className="text-white" size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Subdomain</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{formData.subdomain}.{mainDomain}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => setShowPlanSelection(true)}
                      className={cn(
                        "w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer rounded-2xl p-5 border-2 shadow-sm",
                        selectedPlan.color === 'rose' ? "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-100 dark:border-rose-900/30" :
                        selectedPlan.color === 'purple' ? "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-100 dark:border-purple-900/30" :
                        "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{selectedPlan.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "px-3 py-1 text-white text-[10px] font-bold rounded-full uppercase",
                            selectedPlan.color === 'rose' ? "bg-rose-500" :
                            selectedPlan.color === 'purple' ? "bg-purple-600" :
                            "bg-amber-600"
                          )}>
                            {selectedPlan.period}
                          </span>
                          <RotateCcw size={14} className="text-gray-400" />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{selectedPlan.description}</p>
                      <p className="text-[10px] text-rose-primary font-bold mt-2 flex items-center">
                        Değiştirmek için tıklayın <ArrowRight size={10} className="ml-1" />
                      </p>
                    </button>
                  </div>
                  
                  <div className="space-y-4 py-6 border-t-2 border-b-2 border-gray-50 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Kurulum Ücreti</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₺{selectedPlan.setupFee}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {selectedPlan.id === 'lifetime' ? 'Üyelik Ücreti' : `${selectedPlan.period} Üyelik`}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">₺{selectedPlan.subscriptionFee}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-6">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Toplam</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-rose-primary">₺{selectedPlan.total}</span>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">KDV DAHİL</p>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-5 border-2 border-green-100 dark:border-green-900/30 mb-8">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                        <Rocket className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-800 dark:text-green-400 mb-1">7 Gün Deneme!</p>
                        <p className="text-[10px] text-green-700 dark:text-green-500 font-medium leading-tight">Memnun kalmazsanız anında iade edebilirsiniz.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {[
                      { icon: <CheckCircle className="text-green-500" size={14} />, text: "Anında aktif olur" },
                      { icon: <CheckCircle className="text-green-500" size={14} />, text: "Tüm özelliklere erişim" },
                      { icon: <CheckCircle className="text-green-500" size={14} />, text: "1GB depolama alanı" },
                      { icon: <CheckCircle className="text-green-500" size={14} />, text: "Sınırsız anı ve fotoğraf" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center space-x-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                        {item.icon}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t-2 border-gray-50 dark:border-slate-700">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-4 font-bold">GÜVENLİ ÖDEME SAĞLAYICISI</p>
                    <div className="flex items-center justify-center space-x-4 opacity-60 hover:opacity-100 transition-opacity">
                      <img src="https://www.iyzico.com/assets/images/content/iyzico-logo.svg" alt="iyzico" className="h-6 dark:brightness-0 dark:invert" />
                      <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthLayout quote="Birlikte yeni bir dünya kurmaya hazır mısınız?" isWide={step === 3 || step === 4}>
      <div className={cn("mb-8", (step === 3 || step === 4) && "max-w-2xl mx-auto")}>
        {renderProgressIndicator()}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stepTitles[step-1]}</h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Adım {step} / {totalSteps}</p>
      </div>

      <div className="flex justify-center">
        {renderStep()}
      </div>

      {step === 1 && (
        <div className="text-center pt-8 border-t border-gray-100 dark:border-slate-800 mt-8 max-w-md mx-auto">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Zaten üye misiniz? 
            <Link href="/login" className="text-rose-primary hover:text-coral-warm font-bold transition-colors ml-2 underline underline-offset-4">
              Giriş yapın
            </Link>
          </p>
        </div>
      )}

      {/* Plan Selection Overlay */}
      {showPlanSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 lg:p-12 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowPlanSelection(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <CheckCircle className="rotate-45" size={32} />
            </button>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Planınızı Değiştirin</h2>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Size en uygun planı seçerek devam edebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setShowPlanSelection(false);
                  }}
                  className={cn(
                    "relative group cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl",
                    selectedPlanId === plan.id 
                      ? "border-rose-primary bg-rose-50/30 dark:bg-rose-950/10 scale-[1.02]" 
                      : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-rose-200 dark:hover:border-rose-900/30"
                  )}
                >
                  {selectedPlanId === plan.id && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-primary text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg z-10">
                      SEÇİLİ PLAN
                    </div>
                  )}

                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                    plan.color === 'rose' ? "bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-200" :
                    plan.color === 'purple' ? "bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-200" :
                    "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200"
                  )}>
                    {plan.id === 'monthly' ? <Calendar className="text-white" size={28} /> : 
                     plan.id === 'yearly' ? <Rocket className="text-white" size={28} /> : 
                     <Heart className="text-white fill-current" size={28} />}
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">₺{plan.total}</span>
                      <span className="text-xs font-bold text-gray-400 uppercase">{plan.period === 'Tek Seferlik' ? 'Toplam' : plan.period}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold">₺{plan.setupFee} Kurulum + ₺{plan.subscriptionFee} Üyelik</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {[
                      "Tüm premium özellikler",
                      "Sınırsız fotoğraf yükleme",
                      "Özel subdomain",
                      plan.id === 'lifetime' ? "Ömür boyu erişim" : "7 gün ücretsiz deneme"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center space-x-2 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                        <Check size={12} className="text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className={cn(
                    "w-full py-4 rounded-xl font-bold text-sm transition-all text-center",
                    selectedPlanId === plan.id 
                      ? "bg-rose-primary text-white" 
                      : "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 group-hover:bg-rose-50 group-hover:text-rose-primary"
                  )}>
                    {selectedPlanId === plan.id ? 'Seçili Plan' : 'Bu Planı Seç'}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setShowPlanSelection(false)}
                className="text-gray-500 dark:text-gray-400 font-bold hover:text-rose-primary transition-colors flex items-center space-x-2 mx-auto"
              >
                <ArrowLeft size={18} />
                <span>Vazgeç ve Mevcut Planla Devam Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
