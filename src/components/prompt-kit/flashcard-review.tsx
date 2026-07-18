"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react"

const SAMPLE_CARDS = [
  { id: "1", front: "What is the attention mechanism?", back: "A method that allows models to focus on specific parts of the input sequence when producing each element of the output.", mastered: true },
  { id: "2", front: "What does BERT stand for?", back: "Bidirectional Encoder Representations from Transformers.", mastered: false },
  { id: "3", front: "What is positional encoding?", back: "A technique used in transformers to give the model information about the relative or absolute position of tokens in a sequence.", mastered: false },
]

export function FlashcardReview() {
  const [index, setIndex] = React.useState(0)
  const [flipped, setFlipped] = React.useState(false)
  const card = SAMPLE_CARDS[index]

  const handleFlip = () => setFlipped((v) => !v)

  const handleNext = () => {
    setFlipped(false)
    setIndex((i) => (i + 1) % SAMPLE_CARDS.length)
  }

  const handlePrev = () => {
    setFlipped(false)
    setIndex((i) => (i - 1 + SAMPLE_CARDS.length) % SAMPLE_CARDS.length)
  }

  const handleRate = ( mastered: boolean) => {
    setFlipped(false)
    handleNext()
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
            {index + 1} / {SAMPLE_CARDS.length}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((index + 1) / SAMPLE_CARDS.length) * 100}%` }}
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
