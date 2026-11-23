import { ImageResponse } from 'next/og'

export const size = {
  width: 64,
  height: 64,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #050508 0%, #0F172A 100%)',
          borderRadius: '16px',
          border: '2px solid #10B981',
          color: '#FFFFFF',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: '-1px',
        }}
      >
        MD
      </div>
    ),
    { ...size }
  )
}
