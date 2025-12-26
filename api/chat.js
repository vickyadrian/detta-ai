export default async function handler(req, res) {
  // 1️⃣ Method check
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // 2️⃣ Parse body
  let message;
  try {
    message = (req.body?.message || "").trim();
  } catch {
    return res.status(400).json({
      error: "Invalid JSON"
    });
  }

  if (!message) {
    return res.status(400).json({
      error: "Message is required"
    });
  }

  // 3️⃣ Ambil API key
  const apiKey = process.env.BYTEZ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "API key not set"
    });
  }

  // 4️⃣ Payload ke Bytez (SAMA seperti Python)
  const payload = {
    model: "openai/gpt-4o",
    messages: [
      { role: "user", content: message }
    ],
    max_tokens: 400
  };

  try {
    const response = await fetch(
      "https://api.bytez.com/models/v2/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Request failed"
    });
  }
}
