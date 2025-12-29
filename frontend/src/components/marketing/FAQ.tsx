import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Subdomain nedir ve nasıl seçilir?",
    answer: "Subdomain, sizin özel web adresinizdir (örn: ahmet-ayse.ciftopia.com). İsimlerinizi veya özel bir kelimeyi kullanabilirsiniz. Kayıt sırasında müsaitlik kontrol edilir.",
    color: "from-rose-50 to-pink-50 dark:from-rose-950/10 dark:to-pink-950/10",
    iconColor: "text-rose-500"
  },
  {
    question: "Partnerim Çiftopia'yı kullanmıyorsa ne olur?",
    answer: "Siz kayıt olup partnerinizin bilgilerini girebilirsiniz. Daha sonra partnerinize giriş bilgilerini vererek siteyi birlikte kullanabilirsiniz. Sürpriz yapmak isteyenler için ideal!",
    color: "from-purple-50 to-indigo-50 dark:from-purple-950/10 dark:to-indigo-950/10",
    iconColor: "text-purple-500"
  },
  {
    question: "Verilerim güvende mi?",
    answer: "Evet! SSL şifreleme, günlük yedekleme ve KVKK uyumlu altyapımızla verileriniz maksimum güvenlikte. Sadece siz ve partneriniz erişebilirsiniz.",
    color: "from-blue-50 to-cyan-50 dark:from-blue-950/10 dark:to-cyan-950/10",
    iconColor: "text-blue-500"
  },
  {
    question: "Aboneliğimi iptal edebilir miyim?",
    answer: "Aylık pakette istediğiniz zaman iptal edebilirsiniz. İptal sonrası o dönem sonuna kadar erişiminiz devam eder. Verilerinizi indirme seçeneği sunuyoruz.",
    color: "from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10",
    iconColor: "text-amber-500"
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <span className="text-rose-primary font-bold text-sm uppercase tracking-widest">Destek</span>
          <h2 className=" text-5xl font-bold text-gray-900 dark:text-white">Sıkça Sorulan Sorular</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem 
              key={idx} 
              value={`item-${idx}`}
              className={cn(
                "rounded-[2rem] px-8 border-2 border-transparent transition-all overflow-hidden",
                "bg-gradient-to-br shadow-sm hover:shadow-md",
                faq.color
              )}
            >
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center text-left font-bold text-xl text-gray-900 dark:text-white">
                  <HelpCircle className={cn("mr-4 shrink-0", faq.iconColor)} size={24} />
                  {faq.question}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed pb-6 ml-10">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

