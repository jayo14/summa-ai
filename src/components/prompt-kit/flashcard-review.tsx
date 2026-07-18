"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react"
import type { Flashcard } from "@/lib/api"
import { fetchFlashcards, updateFlashcard } from "@/lib/api"

const SAMPLE_CARDS: Flashcard[] = [
  { id: "1", front: "What is the attention mechanism?", back: "A method that allows models to focus on specific parts of the input sequence when producing each element of the output.", mastered: true, ease_factor: 2.5, interval_days: 0, repetitions: 0, next_review_at: "", created_at: "" },
  { id: "2", front: "What does BERT stand for?", back: "Bidirectional Encoder Representations from Transformers.", mastered: false, ease_factor: 2.5, interval_days: 0, repetitions: 0, next_review_at: "", created_at: "" },
  { id: "3", front: "What is positional encoding?", back: "A technique used in transformers to give the model information about the relative or absolute position of tokens in a sequence.", mastered: false, ease_factor: 2.5, interval_days: 0, repetitions: 0, next_review_at: "", created_at: "" },
]

export function FlashcardReview() {
  const { data: session } = useSession()
  const token = session?.accessToken as string | undefined
  const [cards, setCards] = React.useState<Flashcard[]>(SAMPLE_CARDS)
  const [index, setIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const card = cards[index] ?? cards[0]

  React.useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetchFlashcards(token).then((fetched) => {
      if (fetched && fetched.length > 0) {
        setCards(fetched)
      }
      setLoading(false)
    })
  }, [token])

  const handleFlip = () => setFlipped((v) => !v)

  const handleNext = () => {
    setFlipped(false)
    setIndex((i) => (i + 1) % cards.length)
  }

  const handlePrev = () => {
    setFlipped(false)
    setIndex((i) => (i - 1 + cards.length) % cards.length)
  }

  const handleRate = (mastered: boolean) => {
    const current = cards[index]
    if (token && current) {
      updateFlashcard(token, current.id, {
        mastered,
        ease_factor: mastered ? Math.min(current.ease_factor + 0.15, 3.0) : Math.max(current.ease_factor - 0.2, 1.3),
        interval_days: mastered ? (current.interval_days || 1) * 2 : 0,
        repetitions: mastered ? current.repetitions + 1 : 0,
      })
    }
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, mastered } : c))
    )
    setFlipped(false)
    handleNext()
  }

  if (loading) {
    return (
      <div className="thin-scroll flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
          <p className="text-sm text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="thin-scroll flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review cards to strengthen memory.
            </p>
          </div>
          <Badge variant="secondary">
            {index + 1} / {cards.length}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((index + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={handleFlip}
        >
          <CardContent className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
            <div className="text-lg font-medium">{flipped ? card.back : card.front}</div>
            <div className="mt-4 text-xs text-muted-foreground">
              {flipped ? "Click to see question" : "Click to reveal answer"}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="size-4" />
          </Button>

          {flipped ? (
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => handleRate(false)}>
                <X className="size-4" />
                Again
              </Button>
              <Button className="gap-2" onClick={() => handleRate(true)}>
                <Check className="size-4" />
                Got it
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleFlip}>
              <RotateCcw className="size-4" />
            </Button>
          )}

          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
