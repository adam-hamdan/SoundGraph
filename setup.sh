#!/usr/bin/env bash
set -e

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[info]${NC} $*"; }
success() { echo -e "${GREEN}[ok]${NC} $*"; }
warn()    { echo -e "${YELLOW}[warn]${NC} $*"; }
error()   { echo -e "${RED}[error]${NC} $*"; exit 1; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   SoundGraph — Setup Script              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── Check dependencies ───────────────────────────────────────────────────────
info "Checking dependencies..."

command -v java  >/dev/null 2>&1 || error "Java not found. Install Java 17+ (e.g. brew install openjdk@17)"
command -v mvn   >/dev/null 2>&1 || error "Maven not found. Install with: brew install maven"
command -v mysql >/dev/null 2>&1 || error "MySQL client not found. Install with: brew install mysql"
command -v node  >/dev/null 2>&1 || error "Node.js not found. Install with: brew install node"
command -v npm   >/dev/null 2>&1 || error "npm not found."

JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
[[ "$JAVA_VER" -ge 17 ]] 2>/dev/null || warn "Java 17+ recommended (found: $(java -version 2>&1 | head -1))"

success "All dependencies found."

# ─── DB credentials ───────────────────────────────────────────────────────────
echo ""
info "MySQL credentials"
read -rp "  MySQL host [localhost]: "    DB_HOST;  DB_HOST="${DB_HOST:-localhost}"
read -rp "  MySQL port [3306]: "         DB_PORT;  DB_PORT="${DB_PORT:-3306}"
read -rp "  MySQL user [root]: "         DB_USER;  DB_USER="${DB_USER:-root}"
read -rsp "  MySQL password (hidden): "  DB_PASS;  echo ""

# Test connection
info "Testing MySQL connection..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" >/dev/null 2>&1 \
  || error "Cannot connect to MySQL. Check your credentials."
success "MySQL connection OK."

# ─── Write config.properties ─────────────────────────────────────────────────
info "Writing config.properties..."
cat > config.properties << EOF
db.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/soundgraph?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.user=${DB_USER}
db.password=${DB_PASS}
db.driver=com.mysql.cj.jdbc.Driver
web.port=8080
EOF
cp config.properties src/main/resources/config.properties
success "config.properties written."

# ─── Load database ────────────────────────────────────────────────────────────
echo ""
info "Setting up database..."

# Drop existing (optional)
read -rp "  Drop and recreate soundgraph database if it exists? [y/N]: " RESET
if [[ "$RESET" =~ ^[Yy]$ ]]; then
  mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" \
    -e "DROP DATABASE IF EXISTS soundgraph;" 2>/dev/null || true
  info "Existing database dropped."
fi

mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" < db/schema.sql   && success "Schema loaded."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" soundgraph < db/data.sql     && success "Seed data loaded."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" soundgraph < db/triggers.sql && success "Triggers and stored procedures loaded."

# Quick sanity check
ARTIST_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" soundgraph \
  -se "SELECT COUNT(*) FROM Artist;" 2>/dev/null)
success "Database ready — $ARTIST_COUNT artists loaded."

# ─── Maven build ─────────────────────────────────────────────────────────────
echo ""
info "Building Java project..."
mvn package -q && success "JAR built → target/soundgraph.jar"

# ─── Frontend install ─────────────────────────────────────────────────────────
echo ""
info "Installing frontend dependencies..."
(cd frontend && npm install --silent) && success "npm install done."

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}Next: populate the database with real data${NC}"
echo -e "  ${CYAN}Step 1:${NC} Add API keys to .env (ask a teammate for the file)"
echo -e "  ${CYAN}Step 2:${NC} pip3 install musicbrainzngs kaggle faker pymysql pandas rapidfuzz"
echo -e "  ${CYAN}Step 3:${NC} python3 scripts/populate.py --all"
echo ""
echo -e "  ${CYAN}CLI:${NC}     java -jar target/soundgraph.jar"
echo ""
echo -e "  ${CYAN}Web UI:${NC}  Terminal 1 → java -jar target/soundgraph.jar --web"
echo -e "           Terminal 2 → cd frontend && npm run dev"
echo -e "           Open       → http://localhost:5173"
echo ""
