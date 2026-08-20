import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatComponentRenderer, type ChatComponentData } from './chat-components'

const quiz: ChatComponentData = {
  type: 'quiz',
  title: 'Recursion Quiz',
  questions: [
    {
      id: 'q1',
      question: 'What stops recursion?',
      options: ['A base case', 'A loop', 'A pointer', 'A stack overflow'],
      correctIndex: 0,
      explanation: 'The base case halts further recursive calls.',
    },
  ],
}

describe('ChatComponentRenderer', () => {
  it('renders a real, interactive quiz for a validated quiz payload', async () => {
    const user = userEvent.setup()
    render(<ChatComponentRenderer data={quiz} />)

    expect(screen.getByText('Recursion Quiz')).toBeInTheDocument()
    expect(screen.getByText('What stops recursion?')).toBeInTheDocument()

    await user.click(screen.getByText('A base case'))

    expect(await screen.findByText(/base case halts further recursive calls/i)).toBeInTheDocument()
  })

  it('degrades to a plain message for an unrecognized component type instead of throwing', () => {
    const unknown = { type: 'not-a-real-type' } as unknown as ChatComponentData
    expect(() => render(<ChatComponentRenderer data={unknown} />)).not.toThrow()
    expect(screen.getByText(/couldn't build that component/i)).toBeInTheDocument()
  })
})
