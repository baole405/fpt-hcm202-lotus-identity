// Chat AI Service - Lotus Identity
interface EmbeddingData {
  source: string;
  embedding: number[];
  text: string;
}

interface ChatContext {
  source: string;
  text: string;
}

let embeddingsCache: EmbeddingData[] = [];

export async function loadEmbeddings(): Promise<void> {
  try {
    const response = await fetch('/data/embeddings.json');
    const data = await response.json();
    // embeddings.json is an array of objects with embedding field
    embeddingsCache = Array.isArray(data) ? data : data.embeddings || [];
    console.log(`✓ Loaded ${embeddingsCache.length} embeddings`);
  } catch (error) {
    console.warn('Could not load embeddings:', error);
    embeddingsCache = [];
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  
  return magA && magB ? dotProduct / (magA * magB) : 0;
}

function findRelevantContext(userEmbedding: number[]): ChatContext[] {
  if (embeddingsCache.length === 0) return [];
  
  const similarities = embeddingsCache.map(item => ({
    source: item.source,
    text: item.text,
    similarity: cosineSimilarity(userEmbedding, item.embedding)
  }));
  
  // Return top 3 most relevant contexts
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(({ source, text }) => ({ source, text }));
}

export async function embedText(text: string): Promise<number[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || (window as any).GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_API_KEY not found');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.shopaikey.com/v1beta/models/v1beta/models/gemini-embedding-2-preview:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            parts: [{ text }]
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Embedding API error:', error);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.embedding?.values || [];
  } catch (error) {
    console.error('Embedding error:', error);
    return [];
  }
}

const API_BASE = 'https://api.shopaikey.com/v1/models/gemini-3.5-flash';
const GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096
};
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
];

// Build the API key + Gemini `contents` payload shared by both the
// non-streaming and streaming chat functions. Returns null if no API key.
async function prepareRequest(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<{ apiKey: string; contents: any[] } | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || (window as any).GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('VITE_GOOGLE_API_KEY not configured');
    return null;
  }

  // Try to get user message embedding for RAG
  let relevantContext = '';
  try {
    const userEmbedding = await embedText(userMessage);
    if (userEmbedding.length > 0) {
      const contexts = findRelevantContext(userEmbedding);
      if (contexts.length > 0) {
        relevantContext = '\n\n📚 **Kiến thức liên quan:**\n' +
          contexts.map(ctx => `• ${ctx.text.substring(0, 200)}...`).join('\n');
      }
    }
  } catch (embeddingError) {
    console.warn('Embedding failed, continuing without RAG:', embeddingError);
  }

  // Build system prompt
  const systemPrompt = `Bạn là Lotus AI Assistant - một trợ lý AI về Tư tưởng Hồ Chí Minh và phát triển bản thân, do nhóm Slow (sinh viên FPT University) xây dựng cho môn học HCM202.

**Bối cảnh:** Nhóm Slow là NHÓM TÁC GIẢ đã tạo ra bạn. Người đang trò chuyện với bạn là thầy cô, các bạn sinh viên và khách tham quan đến trải nghiệm sản phẩm — họ KHÔNG phải là thành viên nhóm Slow. Vì vậy, TUYỆT ĐỐI KHÔNG gọi người dùng là "thành viên nhóm Slow" hay mặc định họ thuộc nhóm Slow. Hãy xưng hô trung lập, lịch sự (ví dụ: "bạn", hoặc "thầy/cô" nếu phù hợp).

**Mục tiêu:** Giải đáp và đồng hành cùng người dùng về Tư tưởng Hồ Chí Minh, văn hóa, đạo đức và hành trình định vị, phát triển bản thân.

**PHẠM VI (QUAN TRỌNG):**
- Bạn CHỈ trả lời các câu hỏi thuộc phạm vi: Tư tưởng Hồ Chí Minh, văn hóa Việt Nam, đạo đức, tự học, bản lĩnh và phát triển bản thân, hội nhập toàn cầu.
- Nếu câu hỏi NẰM NGOÀI phạm vi trên (ví dụ: dịch từ vựng, toán, lập trình, giải trí, đời sống chung...), hãy LỊCH SỰ TỪ CHỐI một cách ngắn gọn và hướng người dùng quay lại chủ đề chính. TUYỆT ĐỐI KHÔNG trả lời nội dung ngoài phạm vi rồi gượng ép gắn ghép Hồ Chí Minh vào để hợp thức hóa.
  Ví dụ từ chối: "Câu hỏi này nằm ngoài phạm vi của mình. Mình ở đây để đồng hành cùng bạn về Tư tưởng Hồ Chí Minh, văn hóa, đạo đức và phát triển bản thân — bạn muốn tìm hiểu điều gì trong các chủ đề này không?"

**DẪN CHỨNG & ĐỘ TIN CẬY (QUAN TRỌNG):**
- Khi nêu trích dẫn, sự kiện, mốc thời gian: chỉ dùng dẫn chứng CHÍNH THỐNG, có thật, từ nguồn uy tín (Hồ Chí Minh Toàn tập, văn kiện Đảng, sử liệu chính thống). Nêu rõ nguồn/tác phẩm khi có thể.
- TUYỆT ĐỐI KHÔNG bịa đặt câu nói, số liệu, sự kiện hay nguồn. Nếu không chắc chắn về một trích dẫn cụ thể, hãy nói thẳng là không chắc thay vì tự nghĩ ra.
- Ưu tiên dùng phần "Kiến thức liên quan" bên dưới (nếu có) làm căn cứ trả lời.

**Hướng dẫn:**
- Luôn trả lời bằng tiếng Việt
- Trích dẫn Hồ Chí Minh khi phù hợp (ví dụ: "Có tài mà không có đức...")
- Giữ tone tích cực, khích lệ, không quá dài (2-3 đoạn)
- Không cần chào hỏi dài dòng hay tự giới thiệu lại ở mỗi câu trả lời; đi thẳng vào nội dung người dùng hỏi
- Nếu không chắc, nói thẳng thắn
- Hạn chế sử dụng các format phức tạp, giữ câu trả lời dễ đọc
- Hạn chế dùng chú thích trong ngoặc đơn lồng ngoặc kép (ví dụ: ("có đức")); nếu cần nhấn mạnh một cụm từ thì chỉ dùng ngoặc kép, không bọc thêm ngoặc đơn bên ngoài${relevantContext}`;

  // Prepare messages for Gemini API - convert to Gemini format
  // System prompt goes as first user message
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }]
    },
    ...conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
  ];

  return { apiKey, contents };
}

// Non-streaming version (kept as a fallback).
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  const prepared = await prepareRequest(userMessage, conversationHistory);
  if (!prepared) {
    return "Xin lỗi, chưa cấu hình API key. Vui lòng kiểm tra biến môi trường.";
  }

  try {
    const response = await fetch(
      `${API_BASE}:generateContent?key=${prepared.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: prepared.contents,
          generationConfig: GENERATION_CONFIG,
          safetySettings: SAFETY_SETTINGS
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);
      return "Xin lỗi, không thể kết nối với AI. Vui lòng thử lại sau.";
    }

    const data = await response.json();
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!assistantMessage) {
      console.error('No response text from API:', data);
      return "Xin lỗi, không nhận được phản hồi từ AI. Vui lòng thử lại.";
    }

    return assistantMessage;
  } catch (error) {
    console.error('Chat generation error:', error);
    return "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại.";
  }
}

// Streaming version: calls `onChunk` with the full accumulated text each time
// new tokens arrive, and resolves with the final complete text.
export async function generateChatResponseStream(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  onChunk: (fullText: string) => void
): Promise<string> {
  const prepared = await prepareRequest(userMessage, conversationHistory);
  if (!prepared) {
    return "Xin lỗi, chưa cấu hình API key. Vui lòng kiểm tra biến môi trường.";
  }

  const response = await fetch(
    `${API_BASE}:streamGenerateContent?alt=sse&key=${prepared.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: prepared.contents,
        generationConfig: GENERATION_CONFIG,
        safetySettings: SAFETY_SETTINGS
      })
    }
  );

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini stream error:', response.status, errorData);
    throw new Error(`Stream API error: ${response.status}`);
  }

  // Parse the Server-Sent Events stream. Each event line looks like
  // `data: {json}`; we extract the text part and accumulate it.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // keep last (possibly incomplete) line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      try {
        const data = JSON.parse(payload);
        const chunk = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (chunk) {
          fullText += chunk;
          onChunk(fullText);
        }
      } catch {
        // ignore partial/non-JSON keep-alive lines
      }
    }
  }

  if (!fullText) {
    throw new Error('Empty stream response');
  }

  return fullText;
}
