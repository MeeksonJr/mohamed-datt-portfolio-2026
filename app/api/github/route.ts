import { NextResponse } from 'next/server'

interface GitHubRepoSummary {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  topics?: string[]
}

const FALLBACK_REPOS: GitHubRepoSummary[] = [
  {
    name: 'builders-mech-royale',
    description: 'Interactive Python simulation & competitive mechanics engine',
    html_url: 'https://github.com/MeeksonJr/builders-mech-royale',
    language: 'Python',
    stargazers_count: 1,
    updated_at: '2026-11-21T21:18:14Z',
  },
  {
    name: 'rwx-blast-radius',
    description: 'Dependency graph & blast-radius engineering analyzer',
    html_url: 'https://github.com/MeeksonJr/rwx-blast-radius',
    language: 'Python',
    stargazers_count: 1,
    updated_at: '2026-11-21T00:30:52Z',
  },
  {
    name: 'databricks-shopping-sessions',
    description: 'High-throughput C++ session analytics pipeline',
    html_url: 'https://github.com/MeeksonJr/databricks-shopping-sessions',
    language: 'C++',
    stargazers_count: 1,
    updated_at: '2026-11-21T03:56:38Z',
  },
  {
    name: 'SEOSPACE',
    description: 'AuditPulse AI — Technical SEO & AI Search Readiness Crawler',
    html_url: 'https://github.com/MeeksonJr/SEOSPACE',
    language: 'TypeScript',
    stargazers_count: 2,
    updated_at: '2026-11-04T19:01:13Z',
  },
  {
    name: 'clarivisit',
    description: 'Next.js 16 + Tailwind v4 + Gemini 2.5 SaaS experience',
    html_url: 'https://github.com/MeeksonJr/clarivisit',
    language: 'TypeScript',
    stargazers_count: 1,
    updated_at: '2026-10-28T20:14:38Z',
  },
  {
    name: 'resume-builder-plan',
    description: 'ResumeForge AI — Full-Stack Next.js + Stripe + Gemini Career Builder',
    html_url: 'https://github.com/MeeksonJr/resume-builder-plan',
    language: 'TypeScript',
    stargazers_count: 2,
    updated_at: '2026-10-23T21:38:13Z',
  },
]

export async function GET() {
  try {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Mohamed-Datt-Portfolio-2026',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/MeeksonJr', {
        headers,
        next: { revalidate: 1800 },
      }),
      fetch('https://api.github.com/users/MeeksonJr/repos?sort=updated&per_page=8', {
        headers,
        next: { revalidate: 1800 },
      }),
    ])

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json({
        source: 'fallback',
        publicRepos: 50,
        followers: 18,
        repos: FALLBACK_REPOS,
      })
    }

    const user = await userRes.json()
    const repos = (await reposRes.json()) as GitHubRepoSummary[]

    return NextResponse.json({
      source: 'live',
      publicRepos: user.public_repos ?? 50,
      followers: user.followers ?? 18,
      repos: repos.slice(0, 6).map((r) => ({
        name: r.name,
        description: r.description,
        html_url: r.html_url,
        language: r.language,
        stargazers_count: r.stargazers_count,
        updated_at: r.updated_at,
      })),
    })
  } catch {
    return NextResponse.json({
      source: 'fallback',
      publicRepos: 50,
      followers: 18,
      repos: FALLBACK_REPOS,
    })
  }
}
