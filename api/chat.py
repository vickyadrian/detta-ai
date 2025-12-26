import json
import os
import http.client
from urllib.parse import urlparse

def handler(req):
    if req.method != "POST":
        return {"statusCode": 405, "body": "Method Not Allowed"}

    body = json.loads(req.body)
    message = body.get("message")

    if not message:
        return {"statusCode": 400, "body": json.dumps({"error": "Message required"})}

    api_key = os.environ.get("BYTEZ_API_KEY")
    if not api_key:
        return {"statusCode": 500, "body": "API key not set"}

    url = "https://api.bytez.com/models/v2/openai/v1/chat/completions"
    parsed = urlparse(url)

    payload = json.dumps({
        "model": "openai/gpt-4o",
        "messages": [{"role": "user", "content": message}],
        "max_tokens": 500
    })

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    conn = http.client.HTTPSConnection(parsed.netloc, timeout=8)
    conn.request("POST", parsed.path, payload, headers)
    res = conn.getresponse()
    data = json.loads(res.read())
    conn.close()

    output = data["choices"][0]["message"]["content"]

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"output": output})
    }
