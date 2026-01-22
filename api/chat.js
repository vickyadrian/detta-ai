export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Mengecek apakah ada pesan dalam body
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not set" });
  }

  try {
    const r = await fetch(
      "https://api.bytez.com/models/v2/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            // Instruksi sistem untuk mengatur gaya percakapan AI
            {
              role: "system",
              content: "Website ini dibuat oleh Vicky Adrian Pratama, seorang siswa jurusan Teknik Jaringan Komputer (TKJ) di SMK Negeri 1 Kendal. Sebagai seorang yang bersemangat di dunia teknologi, khususnya dalam pengembangan web dan jaringan komputer, Vicky berusaha untuk terus mengasah keterampilan dalam berbagai bidang, mulai dari desain web hingga pemrograman. Website ini menjadi salah satu wadah bagi Vicky untuk menampilkan proyek-proyek yang dikerjakan, termasuk eksperimen-eksperimen dengan teknologi terkini seperti AI dan Machine Learning.
Website ini juga menampilkan chatbot AI yang dibangun menggunakan teknologi GPT-4o Mini, sebuah model bahasa AI canggih yang dapat memahami dan menghasilkan teks dalam berbagai konteks. Chatbot ini dirancang untuk memberikan pengalaman interaktif bagi pengunjung website, memungkinkan mereka untuk mendapatkan jawaban yang informatif serta relevan dari AI, dengan respons yang cepat dan akurat. Dengan menggunakan teknologi ini, Vicky berharap dapat mengeksplorasi lebih dalam mengenai penerapan AI dalam dunia web dan memperkenalkan AI dalam berbagai aspek kehidupan sehari-hari.
Sebagai seorang yang juga menggemari dunia freelance, bug hunting, dan web development, Vicky berkomitmen untuk terus belajar dan berkembang, tidak hanya di dunia teori, tetapi juga dengan berpraktek langsung membangun dan mengembangkan berbagai proyek. Melalui website ini, kamu bisa melihat berbagai portfolio dari hasil kerja keras dan eksplorasi yang telah dilakukan oleh Vicky, baik itu dalam pengembangan web, aplikasi, maupun eksperimen dengan perangkat keras seperti ESP8266 dan IoT."
            },
            // Pesan dari pengguna
            {
              role: "user",
              content: message
            }
          ],
          max_completion_tokens: 400
        }),
      }
    );

    const data = await r.json();

    // 🔒 DEFENSIVE CHECK (INI KUNCI)
    if (data.error) {
      console.error("AI provider error:", data.error);
      return res.status(402).json({
        error: data.error,
      });
    }

    if (!data.choices || !data.choices[0]) {
      console.error("Unexpected Bytez response:", data);
      return res.status(502).json({
        error: "Invalid response from AI provider",
      });
    }

    const reply = data.choices[0].message?.content;
    if (!reply) {
      return res.status(502).json({
        error: "Empty AI response",
      });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
        }
