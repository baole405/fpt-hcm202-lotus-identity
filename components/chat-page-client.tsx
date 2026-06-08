'use client'

import Link from 'next/link'
import { FormEvent, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, LibraryBig, MessageSquareQuote, RefreshCcw } from 'lucide-react'

type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
  sources?: string[]
  isStreaming?: boolean
}

type ChatPageClientProps = {
  initialSuggestedQuestions?: string[]
  suggestionPool?: string[]
}

const ROTATION_INTERVAL_MS = 8000
const ROTATION_FADE_MS = 240

function formatInlineMarkdown(text: string) {
  const parts: Array<string | { kind: 'bold' | 'italic'; text: string }> = []
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      parts.push({ kind: 'bold', text: match[1] })
    } else if (match[2]) {
      parts.push({ kind: 'italic', text: match[2] })
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

function renderInlineMarkdown(text: string, keyPrefix: string) {
  return formatInlineMarkdown(text).map((part, index) => {
    const key = `${keyPrefix}-${index}`

    if (typeof part === 'string') {
      return <span key={key}>{part}</span>
    }

    if (part.kind === 'bold') {
      return (
        <strong key={key} className="font-semibold text-[#f8e3bf]">
          {part.text}
        </strong>
      )
    }

    return (
      <em key={key} className="text-[#d4c1a3]">
        {part.text}
      </em>
    )
  })
}

function renderMarkdownBlocks(text: string) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let bulletItems: string[] = []

  function flushBullets() {
    if (bulletItems.length === 0) return

    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-3 list-disc space-y-2 pl-6 text-[#e7dac3]">
        {bulletItems.map((item, index) => (
          <li key={`bullet-${index}`}>{renderInlineMarkdown(item, `bullet-${blocks.length}-${index}`)}</li>
        ))}
      </ul>,
    )

    bulletItems = []
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()

    if (!line) {
      flushBullets()
      return
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flushBullets()
      const level = headingMatch[1].length
      const content = headingMatch[2]
      const headingClass =
        level <= 2
          ? 'mt-5 text-xl font-semibold text-[#f8e3bf]'
          : 'mt-4 text-lg font-semibold text-[#f3eadc]'

      blocks.push(
        <h3 key={`heading-${index}`} className={headingClass}>
          {renderInlineMarkdown(content, `heading-${index}`)}
        </h3>,
      )
      return
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)$/)
    if (bulletMatch) {
      bulletItems.push(bulletMatch[1])
      return
    }

    flushBullets()
    blocks.push(
      <p key={`paragraph-${index}`} className="leading-7 text-[#e7dac3]">
        {renderInlineMarkdown(line, `paragraph-${index}`)}
      </p>,
    )
  })

  flushBullets()

  return blocks.length > 0 ? blocks : [<p key="paragraph-fallback">{renderInlineMarkdown(text, 'fallback')}</p>]
}

function appendAssistantChunk(messages: ChatMessage[], chunk: string) {
  const nextMessages = [...messages]
  const lastMessage = nextMessages.at(-1)

  if (!lastMessage || lastMessage.role !== 'assistant') {
    nextMessages.push({ role: 'assistant', text: chunk, isStreaming: true })
    return nextMessages
  }

  nextMessages[nextMessages.length - 1] = {
    ...lastMessage,
    text: `${lastMessage.text}${chunk}`,
    isStreaming: true,
  }

  return nextMessages
}

function finishAssistantStream(messages: ChatMessage[]) {
  const nextMessages = [...messages]
  const lastMessage = nextMessages.at(-1)
  if (!lastMessage || lastMessage.role !== 'assistant') return nextMessages

  nextMessages[nextMessages.length - 1] = {
    ...lastMessage,
    isStreaming: false,
  }

  return nextMessages
}

function parseSseEvents(buffer: string) {
  const eventBlocks = buffer.split('\n\n')
  const remainder = eventBlocks.pop() ?? ''
  const events = eventBlocks.map((block) => {
    const lines = block.split('\n')
    const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() ?? 'message'
    const data = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n')

    return { event, data }
  })

  return { events, remainder }
}

function getNextSuggestionBatch(pool: string[], currentQuestions: string[]) {
  if (pool.length <= 4) return pool.slice(0, 4)

  const normalizedCurrent = currentQuestions.map((question) => question.trim().toLocaleLowerCase('vi-VN'))
  const firstCurrent = normalizedCurrent[0]
  const currentStartIndex = firstCurrent
    ? pool.findIndex((question) => question.trim().toLocaleLowerCase('vi-VN') === firstCurrent)
    : -1

  const startIndex = currentStartIndex >= 0 ? (currentStartIndex + 4) % pool.length : 0
  const nextQuestions: string[] = []

  for (let offset = 0; offset < pool.length; offset += 1) {
    const question = pool[(startIndex + offset) % pool.length]
    const normalized = question.trim().toLocaleLowerCase('vi-VN')
    if (nextQuestions.some((item) => item.trim().toLocaleLowerCase('vi-VN') === normalized)) continue
    nextQuestions.push(question)
    if (nextQuestions.length >= 4) break
  }

  return nextQuestions
}

export default function ChatPageClient({
  initialSuggestedQuestions = [],
  suggestionPool = [],
}: ChatPageClientProps) {
  const safeInitialSuggestedQuestions = initialSuggestedQuestions
  const safeSuggestionPool = suggestionPool.length > 0 ? suggestionPool : initialSuggestedQuestions
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(safeInitialSuggestedQuestions)
  const [isSuggestionTransitioning, setIsSuggestionTransitioning] = useState(false)
  const [isSuggestionRotationPaused, setIsSuggestionRotationPaused] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    setSuggestedQuestions(safeInitialSuggestedQuestions)
  }, [safeInitialSuggestedQuestions])

  useEffect(() => {
    if (safeSuggestionPool.length <= 4 || isSuggestionRotationPaused) return

    const rotationTimeoutId = window.setTimeout(() => {
      setIsSuggestionTransitioning(true)

      window.setTimeout(() => {
        setSuggestedQuestions((current) => getNextSuggestionBatch(safeSuggestionPool, current))
        window.requestAnimationFrame(() => {
          setIsSuggestionTransitioning(false)
        })
      }, ROTATION_FADE_MS)
    }, ROTATION_INTERVAL_MS)

    return () => window.clearTimeout(rotationTimeoutId)
  }, [safeSuggestionPool, suggestedQuestions, isSuggestionRotationPaused])

  async function sendMessage(nextText?: string) {
    const text = (nextText ?? input).trim()
    if (!text || loading) return

    const userMessage: ChatMessage = { role: 'user', text }
    const history = [...messages, userMessage].slice(-10).map(({ role, text: content }) => ({
      role,
      text: content,
    }))

    setMessages((current) => [...current, userMessage])
    setInput('')
    setLoading(true)

    try {
      setMessages((current) => [...current, { role: 'assistant', text: '', isStreaming: true }])

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error ?? `HTTP ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Phản hồi stream không có body.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })
        const parsed = parseSseEvents(sseBuffer)
        sseBuffer = parsed.remainder

        for (const event of parsed.events) {
          if (!event.data) continue

          const payload = JSON.parse(event.data) as { text?: string; message?: string }

          if (event.event === 'chunk' && payload.text) {
            setMessages((current) => appendAssistantChunk(current, payload.text ?? ''))
          }

          if (event.event === 'done') {
            setMessages((current) => finishAssistantStream(current))
          }

          if (event.event === 'error') {
            throw new Error(payload.message ?? 'Streaming bị gián đoạn.')
          }
        }
      }

      setMessages((current) => finishAssistantStream(current))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không gửi được yêu cầu.'
      setMessages((current) => {
        const nextMessages = [...current]
        const lastMessage = nextMessages.at(-1)

        if (lastMessage?.role === 'assistant' && lastMessage.isStreaming) {
          nextMessages[nextMessages.length - 1] = {
            role: 'assistant',
            text: `Lỗi: ${message}`,
            isStreaming: false,
          }
          return nextMessages
        }

        return [...nextMessages, { role: 'assistant', text: `Lỗi: ${message}` }]
      })
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  function resetConversation() {
    setMessages([])
    setInput('')
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f0d0b] text-[#f3eadc]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(194,167,125,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(138,26,26,0.2),transparent_28%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(194,167,125,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(194,167,125,0.06)_1px,transparent_1px)] bg-size-[32px_32px]" />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10 2xl:px-12">
        <header className="mb-6 flex flex-col gap-4 border-b border-[#30261c] pb-5 md:mb-8 md:pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c2a77d]">Trợ lý học tập</p>
            <h1 className="font-(family-name:--font-geist-sans) text-3xl font-semibold tracking-tight text-[#f3eadc] sm:text-4xl md:text-5xl">
              Đối thoại môn Mác - Lênin
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#cbbca4] md:text-base">
              Bạn có thể hỏi toàn bộ nội dung môn Mác - Lênin. Riêng các câu hỏi thuộc phần kinh tế đang có tài liệu nền, trợ lý sẽ bám rất chặt vào nội dung học tập đã nạp.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-start lg:justify-end">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-[#30261c] bg-[#16120f] px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#e7dac3] transition-colors hover:border-[#c2a77d] hover:text-[#c2a77d]"
            >
              Quay lại
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={resetConversation}
              className="inline-flex items-center gap-2 border border-[#30261c] bg-transparent px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#cbbca4] transition-colors hover:border-[#8a1a1a] hover:text-[#f3eadc]"
            >
              Làm mới
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        <section className="grid flex-1 gap-4 lg:gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="order-2 flex flex-col gap-5 border border-[#30261c] bg-[#15110e]/90 p-4 backdrop-blur sm:p-5 xl:order-1">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-[#c2a77d]">
                <LibraryBig className="h-4 w-4" />
                Gợi ý nhanh
              </div>
              <p className="text-sm leading-6 text-[#b9ab94]">
                Chọn một câu hỏi gợi ý để bắt đầu cuộc trao đổi. Danh sách này sẽ tự đổi theo chu kỳ từ kho câu hỏi đã tạo sẵn.
              </p>
            </div>

            <div
              className={`grid gap-3 transition-all duration-300 ease-out md:grid-cols-2 xl:grid-cols-1 ${
                isSuggestionTransitioning ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
              }`}
              onMouseEnter={() => setIsSuggestionRotationPaused(true)}
              onMouseLeave={() => setIsSuggestionRotationPaused(false)}
            >
              {(suggestedQuestions ?? []).map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void sendMessage(question)}
                  className="w-full border border-[#30261c] bg-[#100d0b] px-4 py-4 text-left text-sm leading-6 text-[#e7dac3] transition-all hover:border-[#c2a77d] hover:bg-[#191410]"
                >
                  {question}
                </button>
              ))}
            </div>

          </aside>

          <div className="order-1 flex min-h-[62vh] flex-col border border-[#30261c] bg-[#15110e]/80 backdrop-blur sm:min-h-[68vh] xl:order-2">
            <div
              ref={scrollAreaRef}
              className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5 md:p-6 xl:p-7"
            >
              {messages.length === 0 ? (
                <div className="flex h-full min-h-105 flex-col items-center justify-center gap-6 text-center text-[#b9ab94]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#30261c] bg-[#1a1411] text-[#c2a77d]">
                    <MessageSquareQuote className="h-7 w-7" />
                  </div>
                  <div className="max-w-xl space-y-3">
                    <h2 className="text-2xl font-semibold text-[#f3eadc]">Bắt đầu một cuộc hỏi đáp có ngữ cảnh</h2>
                    <p className="text-sm leading-7 md:text-base">
                      Không gian trao đổi này hỗ trợ toàn bộ môn Mác - Lênin. Khi bạn hỏi đúng phần kinh tế đang có dữ liệu nền, câu trả lời sẽ được siết chặt hơn theo đúng nội dung đã nạp.
                    </p>
                  </div>
                </div>
              ) : null}

              {messages.map((message, index) => {
                const isUser = message.role === 'user'

                return (
                  <article
                    key={`${message.role}-${index}-${message.text.slice(0, 16)}`}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-full rounded-2xl border px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:max-w-[92%] md:px-5 xl:max-w-[78%] ${
                        isUser
                          ? 'border-[#5b4633] bg-[#221a15] text-[#f6efe5]'
                          : 'border-[#30261c] bg-[#100d0b] text-[#e7dac3]'
                      }`}
                    >
                      <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#c2a77d]">
                        {isUser ? 'Bạn' : 'Trợ lý'}
                      </p>
                      <div className="space-y-3 text-sm leading-7 md:text-[15px]">
                        {renderMarkdownBlocks(message.text)}
                        {message.isStreaming ? (
                          <span className="inline-block h-5 w-2 animate-pulse rounded-sm bg-[#c2a77d] align-middle" />
                        ) : null}
                      </div>
                    </div>
                  </article>
                )
              })}

            </div>

            <form onSubmit={handleSubmit} className="border-t border-[#30261c] bg-[#120f0c] p-4 sm:p-5">
              <div className="flex items-end gap-3 max-[560px]:flex-col max-[560px]:items-stretch">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Đặt câu hỏi của bạn. Enter để gửi, Shift+Enter để xuống dòng."
                  rows={3}
                  disabled={loading}
                  className="min-h-24 flex-1 resize-y border border-[#30261c] bg-[#0d0a08] px-4 py-4 text-sm leading-7 text-[#f3eadc] outline-none transition-colors placeholder:text-[#7f715e] focus:border-[#c2a77d] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-27"
                />

                <button
                  type="submit"
                  disabled={loading || input.trim().length === 0}
                  className="inline-flex h-13.5 shrink-0 items-center justify-center gap-2 whitespace-nowrap border border-[#8a1a1a] bg-[#8a1a1a] px-5 text-sm font-medium uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-px hover:bg-[#a42222] disabled:cursor-not-allowed disabled:border-[#4b3a32] disabled:bg-[#4b3a32] disabled:text-[#9b8d7b] max-[560px]:w-full"
                >
                  Gửi câu hỏi
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}