import { ProfilePageContent } from './ProfilePageContent'
import { MOCK_INDIVIDUAL_USER, MOCK_BUSINESS_USER } from '@/data/mock'

export async function generateStaticParams() {
  return [
    { id: '101' },
    { id: '202' },
  ]
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = parseInt(id)

  // Simple mock logic
  const user = userId === 202 ? MOCK_BUSINESS_USER : MOCK_INDIVIDUAL_USER

  return <ProfilePageContent user={user} />
}
