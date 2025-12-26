import json
import os
import urllib.request

def handler(request):
    if request.method != "POST":
        return (
            json.dumps({"error": "Method not allowed"}),
            405,
            {"Content-Type": "application/json"}
        )

    try:
        body = json.loads(request.body)
        message = body.get("message", "").strip()
    except Exception:
        return (
            json.dumps({"error": "Invalid JSON"}),
            400,
            {"Content-Type": "application/json"}
        )

    if not message:
        return (
            json.dumps({"error": "Message is required"}),
            400,
            {"Content-Type": "application/json"}
        )

    api_key = os.environ.get("BYTEZ_API_KEY")
    if not api_key:
        return (
            json.dumps({"error": "API key not set"}),
            500,
            {"Content-Type": "application/json"}
        )

    payload = json.dumps({
        "model": "openai/gpt-4o",
        "messages": [{"role": "user", "content": message}],
        "max_tokens": 400
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.bytez.com/models/v2/openai/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode())
            reply = data["choices"][0]["message"]["content"]

        return (
            json.dumps({"reply": reply}),
            200,
            {"Content-Type": "application/json"}
        )

    except Exception as e:
        return (
            json.dumps({"error": str(e)}),
            500,
            {"Content-Type": "application/json"}
        )
