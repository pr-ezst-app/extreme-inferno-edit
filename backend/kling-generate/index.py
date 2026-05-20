"""
Kling AI video generation — create a text-to-video task and return task_id.
"""
import json
import os
import time
import hmac
import hashlib
import base64
import requests

KLING_BASE = "https://api.klingai.com"


def _make_jwt(access_key_id: str, access_key_secret: str) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).rstrip(b"=").decode()
    now = int(time.time())
    payload = base64.urlsafe_b64encode(json.dumps({
        "iss": access_key_id,
        "exp": now + 1800,
        "nbf": now - 5
    }).encode()).rstrip(b"=").decode()
    signature_input = f"{header}.{payload}".encode()
    sig = hmac.new(access_key_secret.encode(), signature_input, hashlib.sha256).digest()
    signature = base64.urlsafe_b64encode(sig).rstrip(b"=").decode()
    return f"{header}.{payload}.{signature}"


def _auth_headers(api_key: str) -> dict:
    """
    Kling API key can be either:
    - A raw JWT token (starts with 'ey')
    - An access_key_id:access_key_secret pair separated by ':'
    """
    if ":" in api_key:
        key_id, key_secret = api_key.split(":", 1)
        token = _make_jwt(key_id, key_secret)
    else:
        token = api_key
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def handler(event: dict, context) -> dict:
    """Generate animated video using Kling AI text-to-video API."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    api_key = os.environ.get("KLING_API_KEY", "")
    if not api_key:
        return {"statusCode": 500, "headers": cors, "body": json.dumps({"error": "KLING_API_KEY not configured"})}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "Invalid JSON body"})}

    prompt = body.get("prompt", "").strip()
    if not prompt:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "prompt is required"})}

    model = body.get("model", "kling-v1")
    duration = body.get("duration", 5)
    aspect_ratio = body.get("aspect_ratio", "16:9")
    negative_prompt = body.get("negative_prompt", "")
    cfg_scale = body.get("cfg_scale", 0.5)
    mode = body.get("mode", "std")

    payload = {
        "model": model,
        "prompt": prompt,
        "duration": duration,
        "aspect_ratio": aspect_ratio,
        "cfg_scale": cfg_scale,
        "mode": mode,
    }
    if negative_prompt:
        payload["negative_prompt"] = negative_prompt

    headers = _auth_headers(api_key)
    resp = requests.post(
        f"{KLING_BASE}/v1/videos/text2video",
        headers=headers,
        json=payload,
        timeout=30,
    )

    if resp.status_code not in (200, 201):
        return {
            "statusCode": resp.status_code,
            "headers": cors,
            "body": json.dumps({"error": "Kling API error", "detail": resp.text}),
        }

    data = resp.json()
    task_id = data.get("data", {}).get("task_id") or data.get("task_id")

    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({"task_id": task_id, "status": "submitted", "raw": data}),
    }
