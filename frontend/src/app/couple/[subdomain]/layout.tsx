import React from 'react';
import { redirect } from 'next/navigation';

async function getPublicCoupleData(subdomain: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${API_URL}/onboarding/check-subdomain?subdomain=${subdomain}`, {
      cache: 'no-store'
    });
    const data = await res.json();
    // available: true -> Müsait (Site YOK)
    // available: false -> Dolu (Site VAR)
    return data.data.available ? null : { exists: true };
  } catch {
    return null;
  }
}

export default async function SubdomainBaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { subdomain: string };
}) {
  const { subdomain } = params;
  
  // 1. Check if the couple site actually exists
  const coupleExists = await getPublicCoupleData(subdomain);
  
  if (!coupleExists) {
    // If site doesn't exist, redirect to main site
    redirect(process.env.NEXT_PUBLIC_URL || 'http://ciftopia.local:3000');
  }

  // 3. Auth check is NOT done here because public site allows anonymous access 
  // (Wait, actually currently it doesn't, but maybe it should? 
  // For now, I'll let child layouts handle auth if needed).
  
  return <>{children}</>;
}
