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
} from 'lucide-react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import type { AgentUIAction } from '@/lib/content/types'
import { cn } from '@/lib/utils'

interface ChatItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  actionLabel?: string
}

const VOICE_PROMPTS = [
  "Tell me Mohamed's story from Guinea to Norfolk",
  'Show me his ODU Edge-AI research lab work',
  'Which SaaS products has Mohamed sold?',
  'Open the AI Resume Tailor for recruiters',
]

export default function VoiceConcierge() {
  const {
    voiceDrawerOpen,
    setVoiceDrawerOpen,
    setAvatarMood,
    setAudioLevel,
    executeAgentAction,
  } = usePortfolioStore()

  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'I am Mo-Twin, Mohamed Datt’s 2026–2027 AI companion. Speak or type to explore his 50+ repos, ODU Edge-AI research, or watch me control the 3D portfolio live.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true)

  const recognitionRef = useRef<any>(null)
  const speakAnimRef = useRef<number | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const micAnimRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clean up audio loops on unmount
  useEffect(() => {
    return () => {
      if (speakAnimRef.current) cancelAnimationFrame(speakAnimRef.current)
      if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current)
      micStreamRef.current?.getTracks().forEach((t) => t.stop())
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speakResponse = (text: string) => {
    if (!voiceOutputEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.02
    utterance.pitch = 1.0
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => {
      setIsSpeaking(true)
      setAvatarMood('speaking')
      const animateSpeech = (time: number) => {
        const simulatedAmplitude =
          0.35 + Math.abs(Math.sin(time * 0.014)) * 0.45 + Math.abs(Math.cos(time * 0.023)) * 0.2
        setAudioLevel(simulatedAmplitude)
        speakAnimRef.current = requestAnimationFrame(animateSpeech)
      }
      speakAnimRef.current = requestAnimationFrame(animateSpeech)
    }

    const stopSpeech = () => {
      setIsSpeaking(false)
      setAvatarMood('idle')
      setAudioLevel(0)
      if (speakAnimRef.current) cancelAnimationFrame(speakAnimRef.current)
    }

    utterance.onend = stopSpeech
    utterance.onerror = stopSpeech

    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatItem = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
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
        speakResponse(data.speakText || data.reply)
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

  const stopListening = () => {
    setIsListening(false)
    setAvatarMood('idle')
    setAudioLevel(0)
    recognitionRef.current?.stop()
    if (micAnimRef.current) cancelAnimationFrame(micAnimRef.current)
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
  }

  const startListening = async () => {
    if (typeof window === 'undefined') return
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRec) {
      setMessages((prev) => [
        ...prev,
        {
          id: `nospeech-${Date.now()}`,
          role: 'assistant',
          content:
            'Voice recognition is not supported in this browser — type a message or click a prompt below!',
        },
      ])
      return
    }

    try {
      // Optional Web Audio analyser for real mic reactivity on the 3D Avatar
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
      // Mic permission fallback without analyser stream
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

  return (
    <>
      {/* Floating Dock Trigger */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setVoiceDrawerOpen(!voiceDrawerOpen)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-[#E06D43]/50 bg-[#1B2034]/90 px-4 py-3 text-xs font-semibold text-[#F5EFE2] shadow-[0_0_35px_rgba(224,109,67,0.38)] backdrop-blur-xl transition hover:border-[#F2A65A] cursor-pointer"
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
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="fixed bottom-20 right-5 z-50 flex h-[540px] w-[calc(100vw-2.5rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-[#E6DEC8]/20 bg-[#181C2E]/95 text-[#F5EFE2] shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-indigo-500/30 ring-1 ring-emerald-400/40">
                  <Bot className="h-4 w-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Mo-Twin • Gemini Voice Agent</p>
                  <p className="font-mono text-[10px] text-emerald-300/90">
                    {isListening
                      ? 'Listening via Mic...'
                      : isSpeaking
                        ? 'Speaking + Syncing 3D Avatar'
                        : 'Synced to Three.js Stage'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking && typeof window !== 'undefined') {
                      window.speechSynthesis.cancel()
                      setIsSpeaking(false)
                      setAudioLevel(0)
                    }
                    setVoiceOutputEnabled((v) => !v)
                  }}
                  className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/10 cursor-pointer"
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
                  onClick={() => setVoiceDrawerOpen(false)}
                  className="rounded-lg border border-white/10 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Voice Starters */}
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
                        ? 'bg-emerald-500 text-slate-950 font-medium'
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
                  <span>Thinking with Gemini...</span>
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
                title={isListening ? 'Stop listening' : 'Speak to Gemini Voice Concierge'}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask or command (e.g. 'Show ODU research')..."
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
              />

              <button
                type="submit"
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
