import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authServiceServer = {
  me: async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Cookie: `accessToken=${token}`,
        },
        cache: 'no-store', // Always fetch fresh user data
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.data.user;
    } catch (error) {
      console.error('Server-side auth check error:', error);
      return null;
    }
  },
};

