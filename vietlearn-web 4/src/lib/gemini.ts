/** Gọi Gemini bằng REST (generativelanguage.googleapis.com). Có khóa VITE_GEMINI_API_KEY thì gọi trực tiếp từ trình duyệt (có stream);
 *  không có thì gọi hàm trung gian /api/chat (khóa nằm ở máy chủ, an toàn hơn). */
export const MODEL = 'gemini-2.5-flash';
export type Msg = { role: 'user' | 'model'; text: string };
const KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
export const aiMode: 'direct' | 'proxy' = KEY ? 'direct' : 'proxy';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL;
const SYSTEM = 'Bạn là EDU AI, trợ lý của ứng dụng VietLearn (Giáo Dục Học Đường) dành cho học sinh THPT Việt Nam. Luôn trả lời bằng tiếng Việt, thân thiện, rõ ràng, ngắn gọn và phù hợp lứa tuổi học sinh. Hỗ trợ học tập, kỹ năng sống, tâm lý và pháp luật học đường. Nếu học sinh có dấu hiệu bị bạo lực, xâm hại hoặc khủng hoảng tinh thần, hãy động viên các em nói với thầy cô hoặc cha mẹ và gợi ý gọi tổng đài quốc gia bảo vệ trẻ em 111.';

class HttpErr extends Error {}
function human(status: number, raw: string): string {
  let msg = raw; try { msg = JSON.parse(raw)?.error?.message ?? raw; } catch { /* giữ nguyên */ }
  if (status === 400 && /api key/i.test(msg)) return 'Khóa API không hợp lệ. Hãy kiểm tra lại VITE_GEMINI_API_KEY.';
  if (status === 403) return 'Khóa API bị từ chối (403). Hãy kiểm tra: đã bật Generative Language API cho khóa, và giới hạn "HTTP referrer" của khóa có gồm tên miền của web này.';
  if (status === 404 && aiMode === 'proxy') return 'Chưa cấu hình khóa AI. Thêm VITE_GEMINI_API_KEY vào .env.local (chạy máy) hoặc vào Environment Variables trên Vercel rồi Redeploy.';
  if (status === 404) return `Không tìm thấy mô hình ${MODEL} cho khóa này.`;
  if (status === 429) return 'Đã vượt hạn mức sử dụng AI. Hãy thử lại sau ít phút.';
  return `Lỗi ${status}: ${msg.slice(0, 200)}`;
}
/** Gộp các lượt liên tiếp cùng vai trò và bỏ lượt rỗng (Gemini cần lịch sử bắt đầu bằng lượt của người dùng). */
function normalize(h: Msg[]): Msg[] {
  const out: Msg[] = [];
  for (const m of h) { if (!m.text.trim()) continue; const l = out[out.length - 1]; if (l && l.role === m.role) l.text += '\n' + m.text; else out.push({ ...m }); }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}
const body = (h: Msg[]) => JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents: normalize(h).map((m) => ({ role: m.role, parts: [{ text: m.text }] })), generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } });
const textOf = (d: any): string => (d?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
const hdr = { 'Content-Type': 'application/json', 'x-goog-api-key': KEY ?? '' };

async function once(h: Msg[], signal?: AbortSignal): Promise<string> {
  const r = await fetch(`${BASE}:generateContent`, { method: 'POST', headers: hdr, body: body(h), signal });
  if (!r.ok) throw new HttpErr(human(r.status, await r.text()));
  const d = await r.json(); if (d.promptFeedback?.blockReason) throw new HttpErr('Câu hỏi bị chặn bởi bộ lọc an toàn của AI.');
  return textOf(d);
}
async function stream(h: Msg[], onText: (t: string) => void, signal?: AbortSignal): Promise<string> {
  const r = await fetch(`${BASE}:streamGenerateContent?alt=sse`, { method: 'POST', headers: hdr, body: body(h), signal });
  if (!r.ok) throw new HttpErr(human(r.status, await r.text()));
  if (!r.body) throw new Error('no-stream');
  const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', out = '';
  for (;;) {
    const { done, value } = await rd.read(); if (done) break;
    buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop() ?? '';
    for (const ln of lines) {
      if (!ln.startsWith('data:')) continue; const j = ln.slice(5).trim(); if (!j) continue;
      let d: any; try { d = JSON.parse(j); } catch { continue; }
      if (d.promptFeedback?.blockReason) throw new HttpErr('Câu hỏi bị chặn bởi bộ lọc an toàn của AI.');
      const t = textOf(d); if (t) { out += t; onText(out); }
    }
  }
  return out;
}
/** Hỏi Gemini. onText nhận toàn bộ câu trả lời tích lũy (để hiện dần). Trả về câu trả lời đầy đủ. */
export async function askGemini(h: Msg[], onText: (t: string) => void, signal?: AbortSignal): Promise<string> {
  let out = '';
  if (aiMode === 'proxy') {
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: normalize(h) }), signal });
    const raw = await r.text(); if (!r.ok) throw new HttpErr(human(r.status, raw));
    try { out = JSON.parse(raw).reply ?? ''; } catch { out = ''; }
  } else {
    try { out = await stream(h, onText, signal); }
    catch (e) { if (e instanceof HttpErr || (e as Error).name === 'AbortError') throw e; out = await once(h, signal); } // trình duyệt không hỗ trợ stream → gọi thường
  }
  if (!out.trim()) throw new HttpErr('AI không trả về nội dung. Bạn thử diễn đạt lại câu hỏi nhé.');
  onText(out); return out;
}
