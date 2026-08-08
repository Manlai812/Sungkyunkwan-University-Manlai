#!/usr/bin/env python3
"""
Local preview server for this site.

Opening index.html directly (file://) will NOT work correctly, because the
browser blocks fetch() of translations.json under the file:// protocol.
Run this instead, then open the printed URL in your browser.

Usage:
    python3 serve.py
    python3 serve.py 3000   (custom port, default is 8000)
"""

import http.server
import socketserver
import sys
import webbrowser
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# Always serve from the folder this script lives in, regardless of cwd.
ROOT = Path(__file__).resolve().parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


def main():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"Serving {ROOT} at {url}  (Ctrl+C to stop)")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
