import type { Metadata } from 'next'
import fs from 'node:fs/promises'
import path from 'node:path'

import ChatPageClient from '@/components/chat-page-client'
import { buildFallbackQuestions, buildQuestionBank, hashContent, pickSuggestedQuestions } from '@/lib/suggested-questions.mjs'

export const metadata: Metadata = {
  title: 'Chat môn Mác - Lênin',
  description:
    'Trang đối thoại học tập cho toàn bộ môn Mác - Lênin, với câu trả lời được siết chặt hơn ở phần kinh tế đang có dữ liệu nền.',
}

const CONTENT_FILE = path.resolve(process.cwd(), 'noidung.md')
const BANK_FILE = path.resolve(process.cwd(), 'data', 'question-bank.json')
const CORE_MARX_STARTERS = [
  'Phân tích quy luật thống nhất và đấu tranh của các mặt đối lập trong phép biện chứng duy vật.',
  'Mối quan hệ giữa vật chất và ý thức theo triết học Mác - Lênin là gì?',
  'Vì sao thực tiễn được coi là cơ sở, động lực và tiêu chuẩn của nhận thức?',
  'Sứ mệnh lịch sử của giai cấp công nhân nên hiểu ngắn gọn và đúng ý như thế nào?',
  'Vai trò của Nhà nước trong điều hòa các quan hệ lợi ích kinh tế ở Việt Nam là gì?',
]

function mergeUniqueQuestions(...questionGroups: string[][]) {
  const merged: string[] = []
  const seen = new Set<string>()

  for (const group of questionGroups) {
    for (const question of group) {
      const normalized = question.trim()
      if (!normalized) continue

      const key = normalized.toLocaleLowerCase('vi-VN')
      if (seen.has(key)) continue

      seen.add(key)
      merged.push(normalized)
    }
  }

  return merged
}

export default async function ChatPage() {
  let initialSuggestedQuestions: string[] = []
  let suggestionPool: string[] = []

  try {
    const content = await fs.readFile(CONTENT_FILE, 'utf8')
    const sourceHash = hashContent(content)
    const rawBank = await fs.readFile(BANK_FILE, 'utf8').catch(() => null)
    const parsedBank = rawBank ? JSON.parse(rawBank) as { questions?: unknown; sourceHash?: unknown } : null

    const bankQuestions = parsedBank?.sourceHash === sourceHash && Array.isArray(parsedBank?.questions)
      ? parsedBank.questions.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : buildQuestionBank(content)

    suggestionPool = mergeUniqueQuestions(CORE_MARX_STARTERS, bankQuestions)

    if (initialSuggestedQuestions.length === 0) {
      initialSuggestedQuestions = pickSuggestedQuestions(suggestionPool, { refreshToken: 'initial-load' })
    }
  } catch {
    suggestionPool = mergeUniqueQuestions(CORE_MARX_STARTERS, buildQuestionBank(''))
    initialSuggestedQuestions = mergeUniqueQuestions(CORE_MARX_STARTERS, buildFallbackQuestions('')).slice(0, 4)
  }

  return (
    <ChatPageClient
      initialSuggestedQuestions={initialSuggestedQuestions}
      suggestionPool={suggestionPool}
    />
  )
}