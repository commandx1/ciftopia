import { cookies } from 'next/headers';
import { DashboardData } from '@/lib/type';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const dashboardServiceServer = {
  getStats: async (): Promise<DashboardData | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: {
          Cookie: `accessToken=${token}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Server-side dashboard stats error:', error);
      return null;
    }
  },
};
