// Hàm trung gian Vercel: giữ khóa Gemini ở máy chủ. Dùng khi KHÔNG đặt VITE_GEMINI_API_KEY.
// Đặt biến môi trường GEMINI_API_KEY trong Vercel > Settings > Environment Variables.
const SYSTEM = 'Bạn là EDU AI, trợ lý của ứng dụng VietLearn (Giáo Dục Học Đường) dành cho học sinh THPT Việt Nam. Luôn trả lời bằng tiếng Việt, thân thiện, rõ ràng, ngắn gọn và phù hợp lứa tuổi học sinh. Hỗ trợ học tập, kỹ năng sống, tâm lý và pháp luật học đường. Nếu học sinh có dấu hiệu bị bạo lực, xâm hại hoặc khủng hoảng tinh thần, hãy động viên các em nói với thầy cô hoặc cha mẹ và gợi ý gọi tổng đài quốc gia bảo vệ trẻ em 111.';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ.' });
  let b = req.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  const history = (Array.isArray(b?.history) ? b.history : []).slice(-20);
  if (!history.length) return res.status(400).json({ error: 'Thiếu nội dung câu hỏi.' });
  const contents = history.map((m) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: String(m.text ?? '').slice(0, 4000) }] }));
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: d?.error?.message || 'Lỗi từ Gemini' });
    const reply = (d.candidates?.[0]?.content?.parts ?? []).map((p) => p.text || '').join('');
    return res.status(200).json({ reply });
  } catch (e) { return res.status(502).json({ error: 'Không kết nối được tới Gemini.' }); }
}
