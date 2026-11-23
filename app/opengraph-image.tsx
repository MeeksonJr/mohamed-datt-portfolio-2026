import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: 'linear-gradient(135deg, #050508 0%, #091224 55%, #062822 100%)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              background: '#0D1321',
            }}
          >
            MD
          </div>
          <span style={{ fontSize: 24, color: '#34D399', fontWeight: 700 }}>
            2026–2027 SPATIAL & AGENTIC PORTFOLIO
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.08 }}>
            Mohamed Datt
          </div>
          <div style={{ fontSize: 32, color: '#CBD5E1', maxWidth: 960 }}>
            Full-Stack AI Engineer • Next.js + Three.js WebGL + Gemini Voice + ODU Edge-AI Lab
          </div>
        </div>

        <div style={{ display: 'flex', gap: '28px', fontSize: 22, color: '#94A3B8' }}>
          <span>50+ GitHub Repos</span>
          <span>•</span>
          <span>2 Commercial SaaS Sold</span>
          <span>•</span>
          <span>1st Place / 13 Teams</span>
          <span>•</span>
          <span>3.8 GPA ODU CS</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
