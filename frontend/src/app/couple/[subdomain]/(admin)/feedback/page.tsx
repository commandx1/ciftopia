import React from 'react';
import FeedbackHero from './_components/FeedbackHero';
import FeedbackInfoCards from './_components/FeedbackInfoCards';
import FeedbackForm from './_components/FeedbackForm';
import FeedbackFaq from './_components/FeedbackFaq';
import FeedbackStats from './_components/FeedbackStats';
import { authServiceServer } from '@/services/api-server';

export const metadata = {
  title: 'Feedback | Çiftopia',
  description: 'Görüşleriniz bizim için çok değerli!',
};

export default async function FeedbackPage() {
  const user = await authServiceServer.me();
  
  return (
    <div className="min-h-screen bg-cream-white pb-20">
      <FeedbackHero />
      <FeedbackInfoCards />
      <FeedbackForm user={user} />
      <FeedbackFaq />
      <FeedbackStats />
    </div>
  );
}
