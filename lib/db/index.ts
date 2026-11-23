import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

declare global {
  // eslint-disable-next-line no-var
  var __portfolioSqlClient: ReturnType<typeof postgres> | undefined
}

/**
 * Returns a Drizzle DB instance only when DATABASE_URL is configured.
 * Allows seamless local preview and static builds without requiring live DB credentials.
 */
export function getDb() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    return null
  }

  if (!globalThis.__portfolioSqlClient) {
    globalThis.__portfolioSqlClient = postgres(connectionString, {
      prepare: false,
      max: 5,
    })
  }

  return drizzle(globalThis.__portfolioSqlClient, { schema })
}

export { schema }
