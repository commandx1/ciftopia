import React from 'react';
import { authServiceServer } from '@/services/api-server';
import { redirect } from 'next/navigation';
import SettingsClient from './_components/SettingsClient';

export default async function SettingsPage() {
  const user = await authServiceServer.me();

  if (!user) {
    redirect('/login');
  }

  return <SettingsClient user={user} />;
}
