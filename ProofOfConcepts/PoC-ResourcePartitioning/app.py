import sys
import math
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

# Core API Handler (Snel en responsief)
class CoreAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status": "Core API is running smoothly on the Manager node!"}')

# Worker API Handler (Simuleert zware last)
class WorkerAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status": "Worker is processing heavy tasks on the Worker node."}')

def run_heavy_task():
    print("Starting heavy route optimization (CPU stress test)...")
    number = 1
    while True:
        number += 1
        is_prime = True
        for i in range(2, int(math.sqrt(number)) + 1):
            if number % i == 0:
                is_prime = False
                break

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--worker":
        # Start de zware taak in de achtergrond
        thread = threading.Thread(target=run_heavy_task)
        thread.daemon = True
        thread.start()
        
        print("Starting Worker Health API on port 8081...")
        # Start een server zodat Docker weet dat de container leeft
        server = HTTPServer(('0.0.0.0', 8081), WorkerAPIHandler)
        server.serve_forever()
    else:
        print("Starting Core API on port 8080...")
        server = HTTPServer(('0.0.0.0', 8080), CoreAPIHandler)
        server.serve_forever()

if __name__ == "__main__":
    main()