type ApiError = {
  response: {
    data: {
      message: string
    }
  }
}

interface PhotoMetadata {
  key?: string
  url: string
  width?: number
  height?: number
  size?: number
}

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  avatar: PhotoMetadata | string
  gender: string
  coupleNames?: string // Token veya /auth/me üzerinden gelen çift isimleri
  coupleId?: {
    _id?: string
    subdomain?: string
    storageUsed?: number
    storageLimit?: number
  }
  relationshipProfile?: RelationshipProfile
}

type CoreNeed = 'communication' | 'trust' | 'attention' | 'goals'
type SensitivityArea = 'uncertainty' | 'neglect' | 'jealousy' | 'finances'

interface RelationshipProfile {
  conflictStyle: 'avoidant' | 'balanced' | 'direct'
  conflictResponse: 'withdraw' | 'talk' | 'deflect'
  emotionalTrigger: 'disappointment' | 'anger' | 'sadness' | 'low_sensitivity'
  decisionStyle: 'collaborative' | 'fast' | 'passive'
  loveLanguage: 'words' | 'time' | 'actions'
  coreNeed: CoreNeed[]
  sensitivityArea: SensitivityArea[]
}

interface Memory {
  _id: string
  title: string
  description: string
  images: string[]
  createdAt: Date
  updatedAt: Date
  mood: string
  location: {
    name: string
    coordinates: [number, number]
  }
  content: string
  date: Date
  favorites: string[]
  authorId: string
  coupleId: string
  photos: PhotoMetadata[]
  rawPhotos?: PhotoMetadata[]
}

interface Poem {
  _id: string
  title: string
  content: string
  dedicatedTo?: User
  authorId: User
  tags: string[]
  isPublic?: boolean
  createdAt: string
  updatedAt: string
}

interface Note {
  _id: string
  content: string
  color: 'pink' | 'yellow' | 'blue' | 'green' | 'purple' | 'orange'
  position?: {
    x: number
    y: number
  }
  isRead: boolean
  readAt?: string
  authorId: User
  createdAt: string
}

interface Album {
  _id: string
  coupleId: { subdomain: string; partner1: User; partner2: User }
  authorId: User
  title: string
  description?: string
  coverPhoto?: PhotoMetadata
  photoCount: number
  date: string
  createdAt: string
}

interface GalleryPhoto {
  _id: string
  coupleId: string
  authorId: User
  albumId?: string
  photo: PhotoMetadata
  caption?: string
  createdAt: string
}

interface DailyQuestion {
  _id: string
  question: string
  category: 'deep' | 'fun' | 'memory' | 'future' | 'challenge'
  emoji: string
  date: string
  aiAnalysis?: string
}

interface BucketListItem {
  _id: string
  coupleId: string
  authorId: User
  title: string
  description?: string
  category: 'travel' | 'food' | 'experience' | 'home' | 'relationship'
  targetDate?: string
  isCompleted: boolean
  completedAt?: string
  completedBy: User[]
  photos?: PhotoMetadata[]
  createdAt: string
  updatedAt: string
}

interface ImportantDate {
  _id: string
  coupleId: string
  authorId: User
  title: string
  date: string
  type: 'dating' | 'first_kiss' | 'relationship' | 'engagement' | 'marriage' | 'birthday' | 'travel' | 'moving' | 'special'
  description?: string
  photo?: PhotoMetadata
  isRecurring: boolean
  createdAt: string
  updatedAt: string
}

interface TimeCapsule {
  _id: string
  coupleId: string
  authorId: User
  title: string
  content: string
  unlockDate: string
  photos: PhotoMetadata[]
  video?: PhotoMetadata
  receiver: 'me' | 'partner' | 'both'
  isOpened: boolean
  reflections: {
    authorId: User
    content: string
    createdAt: string
  }[]
  createdAt: string
  updatedAt: string
}

interface QuestionAnswer {
  _id: string
  userId: string
  coupleId: string
  questionId: string
  answer: string
  answeredAt: string
  isFavorite: boolean
}

interface CoupleQuestionStats {
  currentStreak: number
  longestStreak: number
  totalAnswered: number
  categoryBreakdown: {
    deep: number
    fun: number
    memory: number
    future: number
    challenge: number
  }
}

interface AuthorStats {
  _id: string
  count: number
}

interface Activity {
  _id: string
  userId: User
  coupleId: string
  module: 'memories' | 'gallery' | 'bucket-list' | 'important-dates' | 'poems' | 'notes' | 'time-capsule' | 'daily-question' | 'onboarding' | 'payment'
  actionType: 'create' | 'update' | 'delete' | 'answer' | 'favorite'
  resourceId?: string
  description: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface DashboardData {
  stats: {
    memoryCount: number
    photoCount: number
    poemCount: number
    noteCount: number
    totalContent: number
  }
  coupleInfo: {
    daysActive: number
    storageUsed: number
    storageLimit: number
    relationshipStartDate?: string
    coupleName?: string
    partner1: User
    partner2: User
  }
  recentActivities: Activity[]
  weeklyActivity: {
    day: string
    count: number
    date: string
  }[]
  distribution: {
    label: string
    count: number
    color: string
    percentage: number
  }[]
}

export type {
  ApiError,
  User,
  Memory,
  PhotoMetadata,
  Poem,
  Note,
  Album,
  GalleryPhoto,
  AuthorStats,
  RelationshipProfile,
  DailyQuestion,
  QuestionAnswer,
  CoupleQuestionStats,
  BucketListItem,
  ImportantDate,
  TimeCapsule,
  Activity,
  DashboardData
}
