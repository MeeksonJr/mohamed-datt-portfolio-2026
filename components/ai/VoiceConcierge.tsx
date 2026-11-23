'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Bot,
  Sparkles,
  Loader2,
  AudioWaveform,
  PhoneCall,
  PhoneOff,
} from 'lucide-react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import type { AgentUIAction } from '@/lib/content/types'
import { cn } from '@/lib/utils'

interface ChatItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  actionLabel?: string
  voiceEngine?: string
}

type VoicePreset = 'baritone' | 'studio'

const VOICE_PROMPTS = [
  'What are your skills?',
  'What do you do now?',
  'Show ODU Edge-AI lab research',
  'Which SaaS products were sold?',
]

const PREFERRED_MALE_VOICES = [
  'Brian',
  'Andrew',
  'Guy',
  'Christopher',
  'Steffan',
  'Ryan',
  'Daniel',
  'Alex',
  'Google US English Male',
]

export default function VoiceConcierge() {
  const {
    voiceDrawerOpen,
    setVoiceDrawerOpen,
    setAvatarMood,
    setAudioLevel,
    executeAgentAction,
    layoutStyle,
  } = usePortfolioStore()

  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'I’m Mo-Twin, Mohamed Datt’s 2026–2027 AI companion. Ask about his skills, current ODU Edge-AI research, or start a hands-free Live Voice Call below.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true)
  const [voicePreset, setVoicePreset] = useState<VoicePreset>('baritone')
  const [liveCallActive, setLiveCallActive] = useState(false)

  const recognitionRef = useRef<any>(null)
  const speakAnimRef = useRef<number | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const micAnimRef = useRef<number | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const liveCallRef = useRef<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    liveCallRef.current = liveCallActive
  }, [liveCallActive])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const cleanupPlayback = () => {
    if (speakAnimRef.current) {
      cancelAnimationFrame(speakAnimRef.current)
      speakAnimRef.current = null
    }
    if (audioElRef.current) {
      audioElRef.current.pause()
      audioElRef.current = null
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setAudioLevel(0)
  }

  const stopListening = () => {
    setIsListening(false)
    setAvatarMood('idle')
    setAudioLevel(0)
    recognitionRef.current?.stop()
    if (micAnimRef.current) {
      cancelAnimationFrame(micAnimRef.current)
      micAnimRef.current = null
    }
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
  }

  useEffect(() => {
    return () => {
      cleanupPlayback()
      if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current)
      micStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const speakBrowserFallback = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAvatarMood('idle')
      return
    }
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.96
    // Deep, confident male pitch register
    utterance.pitch = 0.82

    const voices = window.speechSynthesis.getVoices()
    const maleVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          PREFERRED_MALE_VOICES.some((name) => v.name.includes(name))
      ) || voices.find((v) => v.lang.startsWith('en-US'))

    if (maleVoice) utterance.voice = maleVoice

    utterance.onstart = () => {
      setIsSpeaking(true)
      setAvatarMood('speaking')
      const animateSpeech = (time: number) => {
        const amp =
          0.32 + Math.abs(Math.sin(time * 0.013)) * 0.45 + Math.abs(Math.cos(time * 0.021)) * 0.2
        setAudioLevel(amp)
        speakAnimRef.current = requestAnimationFrame(animateSpeech)
      }
      speakAnimRef.current = requestAnimationFrame(animateSpeech)
    }

    const onFinish = () => {
      setIsSpeaking(false)
      setAvatarMood('idle')
      setAudioLevel(0)
      if (speakAnimRef.current) cancelAnimationFrame(speakAnimRef.current)
      if (liveCallRef.current) {
        setTimeout(() => void startListening(), 280)
      }
    }

    utterance.onend = onFinish
    utterance.onerror = onFinish

    window.speechSynthesis.speak(utterance)
  }

  const speakResponse = async (text: string) => {
    if (!voiceOutputEnabled) {
      setAvatarMood('idle')
      return
    }

    cleanupPlayback()
    setIsSpeaking(true)
    setAvatarMood('speaking')

    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, preset: voicePreset }),
      })

      if (!res.ok) {
        speakBrowserFallback(text)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      audioUrlRef.current = url

      const audio = new Audio(url)
      audioElRef.current = audio

      // Subtle Web Audio API Baritone Low-Shelf Warmth (+3dB @ 135Hz) + Real-Time Avatar Amplitude
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AudioCtx()
        if (ctx.state === 'suspended') {
          await ctx.resume()
        }
        const src = ctx.createMediaElementSource(audio)
        const lowShelf = ctx.createBiquadFilter()
        lowShelf.type = 'lowshelf'
        lowShelf.frequency.value = 135
        lowShelf.gain.value = 3.5

        const analyser = ctx.createAnalyser()
        analyser.fftSize = 64

        src.connect(lowShelf)
        lowShelf.connect(analyser)
        analyser.connect(ctx.destination)

        const freqData = new Uint8Array(analyser.frequencyBinCount)
        const tick = () => {
          analyser.getByteFrequencyData(freqData)
          const avg = freqData.reduce((acc, v) => acc + v, 0) / freqData.length
          setAudioLevel(Math.min(1, avg / 85))
          speakAnimRef.current = requestAnimationFrame(tick)
        }
        speakAnimRef.current = requestAnimationFrame(tick)
      } catch {
        const simTick = (time: number) => {
          setAudioLevel(0.35 + Math.abs(Math.sin(time * 0.015)) * 0.45)
          speakAnimRef.current = requestAnimationFrame(simTick)
        }
        speakAnimRef.current = requestAnimationFrame(simTick)
      }

      const finalize = () => {
        cleanupPlayback()
        setAvatarMood('idle')
        if (liveCallRef.current) {
          setTimeout(() => void startListening(), 280)
        }
      }

      audio.onended = finalize
      audio.onerror = () => {
        cleanupPlayback()
        speakBrowserFallback(text)
      }

      await audio.play()
    } catch {
      cleanupPlayback()
      speakBrowserFallback(text)
    }
  }

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    setIsLoading(true)
    setAvatarMood('coding')

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = (await res.json()) as {
        reply: string
        speakText?: string
        uiAction?: AgentUIAction
      }

      const assistantMsg: ChatItem = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        actionLabel: data.uiAction
          ? `${data.uiAction.type}${data.uiAction.payload ? `: ${data.uiAction.payload}` : ''}`
          : undefined,
      }

      setMessages((prev) => [...prev, assistantMsg])

      if (data.uiAction) {
        executeAgentAction(data.uiAction)
      }

      if (voiceOutputEnabled) {
        void speakResponse(data.speakText || data.reply)
      } else {
        setAvatarMood('idle')
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Connection hiccup — try again or use Cmd+K for instant navigation.',
        },
      ])
      setAvatarMood('idle')
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = async () => {
    if (typeof window === 'undefined' || isListening) return
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRec) {
      setLiveCallActive(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `nospeech-${Date.now()}`,
          role: 'assistant',
          content:
            'Voice recognition is unavailable in this browser — type a message or tap a prompt above!',
        },
      ])
      return
    }

    cleanupPlayback()

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        micStreamRef.current = stream
        const ctx = new AudioContext()
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const tick = () => {
          analyser.getByteFrequencyData(dataArray)
          const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length
          setAudioLevel(Math.min(1, avg / 90))
          micAnimRef.current = requestAnimationFrame(tick)
        }
        micAnimRef.current = requestAnimationFrame(tick)
      }
    } catch {
      // Mic analyser fallback
    }

    const recognition = new SpeechRec()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setAvatarMood('listening')
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      stopListening()
      if (transcript) {
        void sendMessage(transcript)
      }
    }

    recognition.onerror = () => stopListening()
    recognition.onend = () => stopListening()

    recognitionRef.current = recognition
    recognition.start()
  }

  const toggleLiveVoiceCall = () => {
    if (liveCallActive) {
      setLiveCallActive(false)
      stopListening()
      cleanupPlayback()
      return
    }
    setLiveCallActive(true)
    setVoiceOutputEnabled(true)
    void speakResponse(
      'Yo, live call connected. Ask me anything about Mohamed’s architecture, ODU research, or projects.'
    )
  }

  return (
    <>
      {/* Floating Dock Trigger (Clears bottom nav bars cleanly on mobile screens) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setVoiceDrawerOpen(!voiceDrawerOpen)}
        className={cn(
          'fixed right-3 z-40 items-center gap-2 rounded-full border border-[#E06D43]/50 bg-[#1B2034]/92 px-3.5 py-2.5 text-xs font-semibold text-[#F5EFE2] shadow-[0_0_35px_rgba(224,109,67,0.38)] backdrop-blur-xl transition hover:border-[#F2A65A] sm:bottom-5 sm:right-5 sm:flex sm:px-4 sm:py-3 cursor-pointer',
          layoutStyle === 'odyssey'
            ? 'hidden'
            : 'flex bottom-[4.25rem]'
        )}
        aria-label="Open Gemini Voice Concierge"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E06D43] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E06D43]" />
        </span>
        <AudioWaveform className="h-4 w-4 text-[#F2A65A]" />
        <span className="hidden sm:inline">Mo-Twin Voice AI</span>
      </motion.button>

      {/* Concierge Panel */}
      <AnimatePresence>
        {voiceDrawerOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Mo-Twin Neural Voice Concierge"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="fixed bottom-20 right-3 z-50 flex h-[min(560px,78dvh)] w-[calc(100vw-1.5rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-[#E6DEC8]/20 bg-[#181C2E]/96 text-[#F5EFE2] shadow-2xl backdrop-blur-2xl sm:right-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#E06D43]/30 to-[#2DD4BF]/25 ring-1 ring-[#E06D43]/45">
                  <Bot className="h-4 w-4 text-[#F2A65A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Mo-Twin • Deep Baritone Neural AI
                  </p>
                  <p className="font-mono text-[10px] text-emerald-300/90">
                    {liveCallActive
                      ? isListening
                        ? 'LIVE CALL • Listening...'
                        : isSpeaking
                          ? 'LIVE CALL • Speaking...'
                          : 'LIVE CALL • Ready'
                      : isSpeaking
                        ? 'Speaking • Deep Baritone Neural'
                        : 'Synced to 3D World Stage'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleLiveVoiceCall}
                  className={cn(
                    'flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] font-bold transition cursor-pointer',
                    liveCallActive
                      ? 'border-rose-500/60 bg-rose-500/20 text-rose-300 animate-pulse'
                      : 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                  )}
                  title={liveCallActive ? 'End Live Voice Call' : 'Start Hands-Free Live Call'}
                >
                  {liveCallActive ? (
                    <PhoneOff className="h-3.5 w-3.5" />
                  ) : (
                    <PhoneCall className="h-3.5 w-3.5" />
                  )}
                  <span>{liveCallActive ? 'End' : 'Call'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) cleanupPlayback()
                    setVoiceOutputEnabled((v) => !v)
                  }}
                  className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/10 cursor-pointer"
                  aria-label={voiceOutputEnabled ? 'Mute voice output' : 'Enable voice output'}
                  title={voiceOutputEnabled ? 'Mute voice output' : 'Enable voice output'}
                >
                  {voiceOutputEnabled ? (
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Close Mo-Twin chat drawer"
                  onClick={() => {
                    setLiveCallActive(false)
                    stopListening()
                    cleanupPlayback()
                    setVoiceDrawerOpen(false)
                  }}
                  className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Deep Voice Profile Strip */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#121625]/80 px-4 py-1.5">
              <span className="font-mono text-[10px] text-[#F2A65A]">
                VOICE TIMBRE
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'baritone', label: 'Deep Baritone' },
                    { id: 'studio', label: 'Warm Studio' },
                  ] as const
                ).map((vp) => (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => setVoicePreset(vp.id)}
                    className={cn(
                      'rounded-md px-2 py-0.5 font-mono text-[10px] font-bold transition cursor-pointer',
                      voicePreset === vp.id
                        ? 'bg-[#E06D43] text-white'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {vp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="flex gap-1.5 overflow-x-auto border-b border-white/10 bg-white/[0.02] px-3 py-2">
              {VOICE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-200 cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Feed */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col gap-1',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-emerald-500 font-medium text-slate-950'
                        : 'border border-white/10 bg-white/[0.05] text-slate-200'
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.actionLabel && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-indigo-300">
                      <Sparkles className="h-2.5 w-2.5" />
                      Executed UI Action ({msg.actionLabel})
                    </span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                  <span>Thinking with Mo-Twin...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice & Text Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void sendMessage(input)
              }}
              className="flex items-center gap-2 border-t border-white/10 bg-black/40 p-3"
            >
              <button
                type="button"
                onClick={isListening ? stopListening : () => void startListening()}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition cursor-pointer',
                  isListening
                    ? 'animate-pulse bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : 'border border-white/15 bg-white/5 text-emerald-300 hover:bg-emerald-500/20'
                )}
                aria-label={isListening ? 'Stop listening' : 'Speak to Mo-Twin Voice AI'}
                title={isListening ? 'Stop listening' : 'Speak to Mo-Twin Voice AI'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                type="text"
                aria-label="Message Mo-Twin AI"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask skills, ODU research, projects..."
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white placeholder:text-slate-400 outline-none focus:border-emerald-400"
              />

              <button
                type="submit"
                aria-label="Send message to Mo-Twin"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
