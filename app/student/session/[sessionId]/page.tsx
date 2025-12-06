/**
 * Student Learning Session Page
 * Dynamic page for running learning activities
 */

"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { LearningInterface } from "@/components/student/learning-interface"

// Mock data for demonstration
const MOCK_CONTENT = {
  type: "text" as const,
  content:
    "The farmer had 24 bright red apples in his basket. He wanted to share them with his neighbor who lived down the road. He gave 8 apples to his neighbor. How many apples does the farmer have now?",
  translation: "农夫篮子里有24个鲜红的苹果。他想和住在路那边的邻居分享。他给了邻居8个苹果。农夫现在还有多少个苹果？",
  vocabulary: [
    {
      word: "farmer",
      definition: "A person who grows food or raises animals on a farm",
      translation: "农夫 (nóng fū)",
    },
    {
      word: "basket",
      definition: "A container made of woven material to carry things",
      translation: "篮子 (lán zi)",
    },
    {
      word: "neighbor",
      definition: "A person who lives near you",
      translation: "邻居 (lín jū)",
    },
  ],
}

const MOCK_QUESTION = {
  prompt: "How many apples does the farmer have now?",
  type: "number" as const,
  hint: "Remember: When we give something away, we subtract. 24 - 8 = ?",
}

export default function SessionPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(10)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmitAnswer = useCallback((answer: string) => {
    console.log("Answer submitted:", answer)
    // In real implementation, this would send to the execution engine
  }, [])

  const handleRequestHint = useCallback(() => {
    console.log("Hint requested")
  }, [])

  const handlePlayAudio = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 10))
    setProgress((prev) => Math.min(prev + 10, 100))
  }, [])

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setProgress((prev) => Math.max(prev - 10, 0))
  }, [])

  return (
    <LearningInterface
      sessionId={sessionId}
      studentName="Maria"
      content={MOCK_CONTENT}
      question={MOCK_QUESTION}
      progress={progress}
      totalSteps={10}
      currentStep={currentStep}
      isLoading={isLoading}
      isStreaming={isStreaming}
      streamingText={streamingText}
      onSubmitAnswer={handleSubmitAnswer}
      onRequestHint={handleRequestHint}
      onPlayAudio={handlePlayAudio}
      onNext={handleNext}
      onBack={handleBack}
    />
  )
}
