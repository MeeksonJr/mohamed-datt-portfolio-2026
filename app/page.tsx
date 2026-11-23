import PortfolioClientShell from '@/components/PortfolioClientShell'
import { isAdminAuthenticated } from '@/lib/auth/admin-auth'
import { loadPortfolioSnapshot } from '@/lib/db/cms-service'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [{ snapshot, persistence }, isAdmin] = await Promise.all([
    loadPortfolioSnapshot(),
    isAdminAuthenticated(),
  ])

  return (
    <PortfolioClientShell
      initialSnapshot={snapshot}
      initialPersistence={persistence}
      initialIsAdmin={isAdmin}
    />
  )
}
