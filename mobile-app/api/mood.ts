import client from './client';

export interface Mood {
  _id: string;
  userId: string;
  coupleId: string;
  emoji: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyMoodStats {
  totalMoods: number;
  emojiCounts: Record<string, number>;
  moods: Mood[];
}

export interface PagedMoodNotes {
  notes: Mood[];
  total: number;
  hasMore: boolean;
}

export const saveMood = async (data: { emoji: string; note?: string; date: string }, token?: string) => {
  const response = await client.post<Mood>('/mood', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMonthlyMoods = async (year: number, month: number, token?: string) => {
  const response = await client.get<MonthlyMoodStats>('/mood/monthly', {
    params: { year, month },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMoodNotes = async (page: number, limit: number, token?: string) => {
  const response = await client.get<PagedMoodNotes>('/mood/notes', {
    params: { page, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
