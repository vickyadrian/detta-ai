export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
          messages: [{ role: "user", content: message }],
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
