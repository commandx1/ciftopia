'use client'

import React, { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { User } from '@/lib/type'
import RelationshipProfileModal from './RelationshipProfileModal'

interface ProfileGateProps {
  initialUser: User
}

export default function ProfileGate({ initialUser }: ProfileGateProps) {
  const { user: storeUser, setUser } = useUserStore()

  useEffect(() => {
    if (initialUser && !storeUser) {
      setUser(initialUser)
    }
  }, [initialUser, storeUser, setUser])

  const currentUser = storeUser || initialUser

  if (currentUser && !currentUser.relationshipProfile) {
    return <RelationshipProfileModal />
  }

  return null
}
