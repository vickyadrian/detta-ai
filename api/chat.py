import json
import os
import urllib.request

def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        body = request.json
        message = body.get("message", "").strip()
    except Exception:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid JSON"})
        }

    if not message:
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Message is required"})
        }

    api_key = os.environ.get("BYTEZ_API_KEY")
    if not api_key:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "API key not set"})
        }

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
        with urllib.request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read().decode())
            reply = data["choices"][0]["message"]["content"]

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"reply": reply})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }