import { NextRequest, NextResponse } from 'next/server'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { z } from 'zod'
import { getGeminiClient } from '@/lib/ai/portfolio-context'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TtsSchema = z.object({
  text: z.string().min(1).max(1200),
  preset: z.enum(['baritone', 'studio']).optional().default('baritone'),
})

function wrapPcm16AsWav(pcmBytes: Buffer, sampleRate = 24000, channels = 1): Buffer {
  const byteRate = sampleRate * channels * 2
  const blockAlign = channels * 2
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcmBytes.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcmBytes.length, 40)
  return Buffer.concat([header, pcmBytes])
}

async function tryGeminiBaritoneTts(
  text: string,
  preset: 'baritone' | 'studio'
): Promise<{ buffer: Buffer; mimeType: string; voiceLabel: string } | null> {
  const ai = getGeminiClient()
  if (!ai) return null

  const voiceName = preset === 'studio' ? 'Fenrir' : 'Charon'
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: `Speak naturally, warmly, and confidently in the tone of a 22-year-old tall African-American software engineer with a slight deep baritone voice:\n\n${text}`,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    })

    const part = response.candidates?.[0]?.content?.parts?.[0]?.inlineData
    if (!part?.data) return null

    const raw = Buffer.from(part.data, 'base64')
    if (part.mimeType?.includes('pcm') || part.mimeType?.includes('L16')) {
      return {
        buffer: wrapPcm16AsWav(raw, 24000, 1),
        mimeType: 'audio/wav',
        voiceLabel: `gemini-${voiceName.toLowerCase()}`,
      }
    }

    return {
      buffer: raw,
      mimeType: part.mimeType || 'audio/wav',
      voiceLabel: `gemini-${voiceName.toLowerCase()}`,
    }
  } catch (err) {
    console.warn('[TTS] Gemini TTS unavailable, switching to Edge Neural baritone:', err)
    return null
  }
}

async function synthesizeSingleEdgeVoice(
  text: string,
  voiceName: string,
  pitch: string,
  rate: string
): Promise<{ buffer: Buffer; mimeType: string; voiceLabel: string }> {
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 8000, synthesisTimeoutMs: 12000 })
  try {
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
    const { audioStream } = tts.toStream(text, { pitch, rate })
    const chunks: Buffer[] = []
    for await (const chunk of audioStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)
    if (buffer.length < 256) {
      throw new Error(`Empty audio stream from ${voiceName}`)
    }
    return {
      buffer,
      mimeType: 'audio/mpeg',
      voiceLabel: voiceName,
    }
  } finally {
    try {
      tts.close()
    } catch {
      // Ignore socket close cleanup errors
    }
  }
}

async function synthesizeEdgeBaritoneTts(
  text: string,
  preset: 'baritone' | 'studio'
): Promise<{ buffer: Buffer; mimeType: string; voiceLabel: string }> {
  const candidates =
    preset === 'studio'
      ? [
          { voice: 'en-US-AndrewMultilingualNeural', pitch: '-9Hz', rate: '+2%' },
          { voice: 'en-US-AndrewNeural', pitch: '-9Hz', rate: '+2%' },
          { voice: 'en-US-ChristopherNeural', pitch: '-7Hz', rate: '+1%' },
        ]
      : [
          { voice: 'en-US-BrianMultilingualNeural', pitch: '-11Hz', rate: '+1%' },
          { voice: 'en-US-GuyNeural', pitch: '-10Hz', rate: '+2%' },
          { voice: 'en-US-ChristopherNeural', pitch: '-8Hz', rate: '+1%' },
        ]

  let lastError: unknown = null
  for (const candidate of candidates) {
    try {
      return await synthesizeSingleEdgeVoice(
        text,
        candidate.voice,
        candidate.pitch,
        candidate.rate
      )
    } catch (err) {
      lastError = err
    }
  }

  throw lastError instanceof Error ? lastError : new Error('All Edge neural voices failed')
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = checkRateLimit(`ai-tts:${ip}`, 30, 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'TTS rate limit reached. Please wait briefly.' },
      { status: 429, headers: { 'Retry-After': rl.retryAfterSeconds.toString() } }
    )
  }

  try {
    const body = await request.json()
    const parsed = TtsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid TTS payload' }, { status: 400 })
    }

    const cleanText = parsed.data.text.replace(/[*_`#]/g, '').trim()
    const geminiAudio = await tryGeminiBaritoneTts(cleanText, parsed.data.preset)
    const resolved =
      geminiAudio || (await synthesizeEdgeBaritoneTts(cleanText, parsed.data.preset))

    return new NextResponse(new Uint8Array(resolved.buffer), {
      headers: {
        'Content-Type': resolved.mimeType,
        'Content-Length': resolved.buffer.length.toString(),
        'X-Voice-Model': resolved.voiceLabel,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[TTS_ERROR]', error)
    return NextResponse.json(
      { error: 'Neural TTS unavailable — client browser fallback active' },
      { status: 503 }
    )
  }
}
