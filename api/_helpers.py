import json
import re
import sys
import os
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

def normalize_phone(phone_str):
    if not phone_str:
        return ""
    cleaned = re.sub(r"[^\d+]", "", str(phone_str).strip())
    digits_only = re.sub(r"\D", "", cleaned)
    return digits_only

def masked_phone(phone):
    p = str(phone)
    if len(p) <= 4:
        return "****"
    return f"{p[:2]}{'*' * (len(p) - 4)}{p[-2:]}"

def calc_dynamic_status(status, quiz_date_str, start_time_str, end_time_str):
    """Replicate Django's calculate_current_lifecycle."""
    if status in ("LIVE", "ENDED", "DRAFT", "ARCHIVED"):
        return status
    import pytz
    from datetime import datetime, timezone as tz
    ist = pytz.timezone("Asia/Kolkata")
    now_ist = datetime.now(tz.utc).astimezone(ist)
    today_str = now_ist.strftime("%Y-%m-%d")
    now_time = now_ist.strftime("%H:%M:%S")

    if quiz_date_str > today_str:
        return "SCHEDULED"
    elif quiz_date_str < today_str:
        return "ENDED"
    else:
        if now_time < start_time_str:
            return "SCHEDULED"
        elif start_time_str <= now_time <= end_time_str:
            return "LIVE"
        else:
            return "ENDED"

def format_time_12h(time_str):
    """Convert HH:MM:SS to 12-hour format."""
    try:
        from datetime import datetime
        t = datetime.strptime(time_str, "%H:%M:%S")
        return t.strftime("%I:%M %p").lstrip("0")
    except Exception:
        return time_str

class BaseHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress default logging

    def do_OPTIONS(self):
        self.send_response(200)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, default=str).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def get_params(self):
        parsed = urlparse(self.path)
        return {k: v[0] for k, v in parse_qs(parsed.query).items()}

    def get_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length:
            try:
                return json.loads(self.rfile.read(length))
            except Exception:
                return {}
        return {}

    def get_path_segment(self, index):
        """Extract path segment at given index (0-based after /api/)."""
        parts = [p for p in urlparse(self.path).path.split("/") if p]
        # parts looks like ['api', 'quiz', '5', 'submit']
        try:
            return parts[index]
        except IndexError:
            return None
