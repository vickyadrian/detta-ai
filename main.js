const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message })
});

const text = await response.text();

let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error("Server returned non-JSON response");
}

if (!response.ok) {
  throw new Error(data.error || "Request failed");
}

aiResponse.textContent = data.reply;
responseContainer.classList.remove('hidden');