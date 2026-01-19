import BetaLaunch from '@/components/marketing/BetaLaunch'
import { Footer } from '@/components/marketing/Footer'
import { Navbar } from '@/components/marketing/Navbar'
import { onboardingService } from '@/services/api'

// Force dynamic rendering to always get the latest count
export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  let initialStatus = { count: 0, limit: 50, available: false }

  try {
    const res = await onboardingService.getEarlyBirdStatus()
    initialStatus = res.data.data
  } catch (error) {
    console.error('Error fetching early bird status on server:', error)
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='pt-10'>
        <BetaLaunch initialStatus={initialStatus} />
      </main>
      <Footer />
    </div>
  )
}
