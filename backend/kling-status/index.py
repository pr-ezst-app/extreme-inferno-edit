"""
Kling AI video status check — poll task status and return video URL when ready.
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
    """Check the status of a Kling AI video generation task."""
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

    params = event.get("queryStringParameters") or {}
    task_id = params.get("task_id", "").strip()

    if not task_id:
        try:
            body = json.loads(event.get("body") or "{}")
            task_id = body.get("task_id", "").strip()
        except Exception:
            pass

    if not task_id:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "task_id is required"})}

    headers = _auth_headers(api_key)
    resp = requests.get(
        f"{KLING_BASE}/v1/videos/text2video/{task_id}",
        headers=headers,
        timeout=20,
    )

    if resp.status_code not in (200, 201):
        return {
            "statusCode": resp.status_code,
            "headers": cors,
            "body": json.dumps({"error": "Kling API error", "detail": resp.text}),
        }

    data = resp.json()
    task_data = data.get("data", {})
    task_status = task_data.get("task_status", "")

    video_url = None
    if task_status == "succeed":
        works = task_data.get("task_result", {}).get("videos", [])
        if works:
            video_url = works[0].get("url")

    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({
            "task_id": task_id,
            "status": task_status,
            "video_url": video_url,
            "raw": task_data,
        }),
    }
