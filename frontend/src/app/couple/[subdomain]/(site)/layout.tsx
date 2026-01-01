import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CoupleLayoutClient from './_components/CoupleLayoutClient';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  if (!token) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: `accessToken=${token}` },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.user;
  } catch {
    return null;
  }
}

export default async function CoupleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  const { subdomain } = params;
  
  // Get current user if logged in
  const user = await getCurrentUser();

  // If no user, redirect to login on main domain
  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_URL}/login`);
  }

  return (
    <CoupleLayoutClient user={user} subdomain={subdomain}>
      {children}
    </CoupleLayoutClient>
  );
}
