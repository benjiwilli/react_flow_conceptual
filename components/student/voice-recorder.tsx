"use client"

/**
 * Voice Recorder Component
 * Speech input for ESL students with pronunciation feedback
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { Mic, MicOff, Loader2, Volume2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface VoiceRecorderProps {
  isRecording: boolean
  onStart: () => void
  onStop: () => void
  onResult: (transcription: string) => void
  maxDuration?: number
  language?: string
  showWaveform?: boolean
  size?: "sm" | "md" | "lg"
}

export function VoiceRecorder({
  isRecording,
  onStart,
  onStop,
  onResult,
  maxDuration = 30,
  language = "en-US",
  showWaveform = true,
  size = "lg",
}: VoiceRecorderProps) {
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [duration, setDuration] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const durationRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check browser support
  const isSpeechRecognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (durationRef.current) {
      clearInterval(durationRef.current)
      durationRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setDuration(0)
    setAudioLevel(0)
  }, [])

  // Ref for stopRecording to avoid circular dependency
  const stopRecordingRef = useRef<() => void>(() => {})

  // Stop recording - defined before startRecording to avoid reference issues
  const stopRecording = useCallback(() => {
    setIsProcessing(true)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    cleanup()
    onStop()
  }, [cleanup, onStop])

  // Update ref when stopRecording changes
  useEffect(() => {
    stopRecordingRef.current = stopRecording
  }, [stopRecording])

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null)
    setIsProcessing(false)

    if (!isSpeechRecognitionSupported) {
      setError("Speech recognition is not supported in your browser")
      return
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio analysis for visualization
      if (showWaveform) {
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyserRef.current)
        analyserRef.current.fftSize = 256

        const updateLevel = () => {
          if (analyserRef.current && isRecording) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
            analyserRef.current.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length
            setAudioLevel(average / 255)
            requestAnimationFrame(updateLevel)
          }
        }
        updateLevel()
      }

      // Set up speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = language

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")

        if (event.results[0].isFinal) {
          setIsProcessing(false)
          onResult(transcript)
          cleanup()
          onStop()
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setError(`Error: ${event.error}`)
        cleanup()
        onStop()
      }

      recognitionRef.current.onend = () => {
        if (isRecording) {
          // Recognition ended but we're still recording - might need to restart
          cleanup()
          onStop()
        }
      }

      recognitionRef.current.start()
      onStart()

      // Duration timer
      durationRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)

      // Max duration timeout
      timerRef.current = setTimeout(() => {
        stopRecordingRef.current()
      }, maxDuration * 1000)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Could not access microphone")
      cleanup()
    }
  }, [isSpeechRecognitionSupported, language, maxDuration, showWaveform, isRecording, onStart, onStop, onResult, cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [cleanup])

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Size classes
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  if (!isSpeechRecognitionSupported) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-amber-50 border border-amber-200">
        <AlertCircle className="h-8 w-8 text-amber-500" />
        <p className="text-center text-amber-800">
          Voice input is not supported in your browser. Please try Chrome or Edge.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Recording Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={cn(
          "relative rounded-full transition-all duration-300",
          sizeClasses[size],
          isRecording
            ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
            : "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Audio Level Ring */}
        {isRecording && showWaveform && (
          <div
            className="absolute inset-0 rounded-full border-4 border-white/50 transition-transform"
            style={{
              transform: `scale(${1 + audioLevel * 0.3})`,
            }}
          />
        )}

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {isProcessing ? (
            <Loader2 className={cn(iconSizes[size], "animate-spin")} />
          ) : isRecording ? (
            <MicOff className={iconSizes[size]} />
          ) : (
            <Mic className={iconSizes[size]} />
          )}
        </div>

        {/* Pulse animation when recording */}
        {isRecording && !isProcessing && (
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" />
        )}
      </button>

      {/* Status Text */}
      <div className="text-center">
        {isProcessing ? (
          <p className="text-muted-foreground">Processing...</p>
        ) : isRecording ? (
          <div className="space-y-1">
            <p className="text-red-600 font-medium">Recording... Tap to stop</p>
            <p className="text-sm text-muted-foreground">{formatDuration(duration)}</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Tap to start speaking</p>
        )}
      </div>

      {/* Duration Warning */}
      {isRecording && duration >= maxDuration - 5 && (
        <p className="text-sm text-amber-600">
          {maxDuration - duration} seconds remaining
        </p>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Audio Playback Component
// ============================================================================

interface AudioPlaybackProps {
  text: string
  language?: string
  autoPlay?: boolean
  onStart?: () => void
  onEnd?: () => void
}

export function AudioPlayback({
  text,
  language = "en-US",
  autoPlay = false,
  onStart,
  onEnd,
}: AudioPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const playAudioRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const playAudio = useCallback(() => {
    if (!synthRef.current || !text) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    utteranceRef.current = new SpeechSynthesisUtterance(text)
    utteranceRef.current.lang = language
    utteranceRef.current.rate = 0.9 // Slightly slower for ESL students
    utteranceRef.current.pitch = 1

    utteranceRef.current.onstart = () => {
      setIsPlaying(true)
      onStart?.()
    }

    utteranceRef.current.onend = () => {
      setIsPlaying(false)
      onEnd?.()
    }

    utteranceRef.current.onerror = () => {
      setIsPlaying(false)
    }

    synthRef.current.speak(utteranceRef.current)
  }, [text, language, onStart, onEnd])

  // Update ref when playAudio changes
  useEffect(() => {
    playAudioRef.current = playAudio
  }, [playAudio])

  // Auto-play effect using ref to avoid stale closures
  useEffect(() => {
    if (autoPlay && text) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        playAudioRef.current()
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [autoPlay, text])

  const stopAudio = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
    }
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isPlaying ? stopAudio : playAudio}
      className={cn("h-10 w-10", isPlaying && "text-blue-500")}
    >
      <Volume2 className={cn("h-5 w-5", isPlaying && "animate-pulse")} />
    </Button>
  )
}

export default VoiceRecorder
