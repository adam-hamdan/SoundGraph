#!/usr/bin/env bash
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[info]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC} $*"; }

kill_port() {
  local port=$1
  local pid
  pid=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [[ -n "$pid" ]]; then
    info "Killing process on port $port (PID $pid)..."
    kill -9 $pid 2>/dev/null || true
    sleep 0.5
  fi
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   SoundGraph — Run Script                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── Kill existing processes on required ports ────────────────────────────────
kill_port 8080
kill_port 5173

# ─── Start backend ────────────────────────────────────────────────────────────
info "Starting backend on port 8080..."
java -jar target/soundgraph.jar --web &
BACKEND_PID=$!

# Wait for backend to be ready
for i in {1..20}; do
  if curl -s http://localhost:8080/api/health >/dev/null 2>&1; then
    success "Backend ready."
    break
  fi
  sleep 1
done

# ─── Start frontend ───────────────────────────────────────────────────────────
info "Starting frontend on port 5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
success "SoundGraph running → http://localhost:5173"
echo ""

# ─── Cleanup on exit ──────────────────────────────────────────────────────────
cleanup() {
  echo ""
  info "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait
