import React from 'react'
import ActivitiesClient from './ActivitiesClient'
import { cookies } from 'next/headers'
import axios from 'axios'

async function getInitialActivities() {
  try {
    const cookieStore = cookies()
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
    
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/activity`, {
      params: { page: 1, limit: 10 },
      headers: {
        Cookie: cookieString
      },
      withCredentials: true
    })
    
    return response.data
  } catch (error) {
    console.error('Sunucu tarafında aktiviteler yüklenirken hata:', error)
    return { activities: [], total: 0, hasMore: false }
  }
}

export default async function Page() {
  const initialData = await getInitialActivities()
  
  return <ActivitiesClient initialActivities={initialData.activities} initialHasMore={initialData.hasMore} />
}
