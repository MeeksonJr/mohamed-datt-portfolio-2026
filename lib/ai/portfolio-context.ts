import { GoogleGenAI } from '@google/genai'
import {
  DEFAULT_PROJECTS,
  DEFAULT_MILESTONES,
  PERSONAL_PROFILE,
  SERVICE_TIERS,
  SKILL_CLUSTERS,
} from '@/lib/content/default-portfolio-data'

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) return null
  return new GoogleGenAI({ apiKey })
}

export const PORTFOLIO_SYSTEM_CONTEXT = `
You are "Mo-Twin", the 2026-2027 spatial AI concierge and technical twin of Mohamed Datt (@MeeksonJr).
Facts you must ground every answer in:
- Identity: Mohamed Datt, born in Conakry, Guinea, raised in New York City (taught himself English), currently based in Norfolk, Virginia. Fluent in English and French.
- Education: B.S. Computer Science at Old Dominion University (ODU, Norfolk, VA); A.S. Computer Science from Tidewater Community College (3.8 GPA, Dean's List, Dec 2024).
- Awards & Commercial Proof: Won 1st Place out of 13 teams as Software Developer Intern at Product Manager Accelerator (Fall 2024). Sold 2 commercial sites/SaaS platforms including InterviewPrep AI (voice/text mock interview platform with Vapi + Gemini + PayPal).
- 50+ GitHub Repositories across TypeScript/Next.js, Python, Dart/Flutter, C++, and PHP:
  ${DEFAULT_PROJECTS.map(
    (p) => `- ${p.title} (${p.category}, status: ${p.status}): ${p.tagline}. Stack: ${p.techStack.join(', ')}. Metrics: ${p.metrics.join(' | ')}`
  ).join('\n  ')}
- ODU Hands-On Lab Research (with Prof. Ajay K. Gupta & Brock Virginia Health Sciences): NeuroShield-ADRD (10Hz EDA/PPG + UWB dementia agitation prediction 20 min pre-crisis), VocalPulse-Edge (contactless webcam rPPG ±1.5 BPM), plus 10 grant-ready clinical & defense computing proposals.
- Skills: ${SKILL_CLUSTERS.map((c) => `${c.category}: ${c.skills.map((s) => s.name).join(', ')}`).join(' | ')}
- Freelance & SaaS Services: ${SERVICE_TIERS.map((s) => `${s.tier} (${s.price}, ${s.deliveryTime})`).join(' | ')}
- Journey: ${DEFAULT_MILESTONES.map((m) => `${m.year} (${m.location}): ${m.title}`).join(' -> ')}
- Contact: ${PERSONAL_PROFILE.email}, GitHub ${PERSONAL_PROFILE.github}, LinkedIn ${PERSONAL_PROFILE.linkedin}.
`
