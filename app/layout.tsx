import type { Metadata } from 'next'
import { Syne, Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-space',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mohameddatt.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Mohamed Datt | Full-Stack AI Engineer & Spatial Web Architect (2026–2027)',
  description:
    'Interactive portfolio & live ResumeForge hub of Mohamed Datt (@MeeksonJr) — Full-Stack AI Engineer (Next.js 16, TypeScript, Three.js, Drizzle ORM, Gemini AI, Python/C++), ODU R1 Edge-AI researcher, 1st-Place winner, and 2x commercial SaaS seller.',
  keywords: [
    'Mohamed Datt',
    'MeeksonJr',
    'Full Stack Software Engineer',
    'AI Engineer',
    'Next.js 16',
    'Three.js',
    'React Three Fiber',
    'Gemini AI',
    'Drizzle ORM',
    'Old Dominion University',
    'Norfolk Virginia',
  ],
  authors: [{ name: 'Mohamed Datt', url: SITE_URL }],
  creator: 'Mohamed Datt',
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    title: 'Mohamed Datt | Full-Stack AI Engineer & Spatial Web Architect',
    description:
      'Born in Guinea, raised in NYC, building in Norfolk, VA. Inspect role-tailored resumes, shipped AI SaaS acquisitions, and ODU Edge-AI research.',
    type: 'profile',
    url: SITE_URL,
    siteName: 'Mohamed Datt Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohamed Datt | Full-Stack AI Engineer & Spatial Web Architect',
    description:
      'Next.js 16 + Three.js + Gemini AI portfolio featuring per-track ResumeForge PDF previews and ODU Hands-On Lab Edge-AI research.',
  },
}

const STRUCTURED_DATA_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Mohamed Datt Portfolio & Studio (2026–2027)',
      description:
        'Full-Stack AI Engineer, ODU Edge-AI Researcher, and Spatial Web Architect portfolio.',
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      mainEntity: { '@id': `${SITE_URL}/#person` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Mohamed Datt',
      alternateName: '@MeeksonJr',
      url: SITE_URL,
      email: 'mailto:d.mohamed1504@gmail.com',
      jobTitle: 'Full-Stack AI Engineer & Computer Science Researcher',
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'Old Dominion University',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Norfolk',
          addressRegion: 'VA',
          addressCountry: 'US',
        },
      },
      sameAs: [
        'https://github.com/MeeksonJr',
        'https://www.linkedin.com/in/mohamed-datt-b60907296',
      ],
      knowsAbout: [
        'Next.js',
        'TypeScript',
        'React 19',
        'Three.js',
        'PostgreSQL',
        'Drizzle ORM',
        'Google Gemini AI',
        'Python',
        'C++',
        'Flutter',
        'Edge AI',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'ResumeForge AI + Mobile',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      author: { '@id': `${SITE_URL}/#person` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'AuditPulse AI (SEOSPACE)',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      author: { '@id': `${SITE_URL}/#person` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'NeuroShield-ADRD & VocalPulse-Edge',
      applicationCategory: 'MedicalApplication',
      operatingSystem: 'Linux, Edge AI',
      author: { '@id': `${SITE_URL}/#person` },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${instrumentSerif.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-[#E06D43] focus:px-4 focus:py-2.5 focus:font-mono focus:text-xs focus:font-bold focus:text-white focus:shadow-2xl"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA_GRAPH) }}
        />
        {children}
      </body>
    </html>
  )
}
