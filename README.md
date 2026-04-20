# SoundGraph — Music Ecosystem & Trend Analytics Platform

CSDS 341 Spring 2026 Final Project  
Team: Alvisa Krasniqi, Adam Hamdan, Eva-Jessy Ouach, Robert Beletsky

## Tech Stack
- **DBMS**: MySQL 8.x
- **Backend/CLI**: Java 17 + JDBC
- **Web UI**: Vite + React + Tailwind CSS
- **Build**: Maven

---

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 20+
- MySQL 8.x running locally

---

## Quick Setup (automated)

```bash
./setup.sh
```

This creates the database, loads the schema, sample data, and triggers, installs frontend dependencies, and builds the JAR — all in one step. You will be prompted for your MySQL root password.

---

## Manual Setup

### 1. Database
```bash
mysql -u root -p < db/schema.sql
mysql -u root -p soundgraph < db/data.sql
mysql -u root -p soundgraph < db/triggers.sql
```

### 2. Config
Edit `config.properties` with your MySQL credentials:
```
db.url=jdbc:mysql://localhost:3306/soundgraph?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.user=root
db.password=YOUR_PASSWORD
```

### 3. Build
```bash
mvn package
cd frontend && npm install
```

---

## Running the App

### Option A — One command (starts everything)
```bash
./run.sh
```
Starts the Java backend on port 8080 and the React frontend on port 5173. Open **http://localhost:5173**.

### Option B — CLI only
```bash
java -jar target/soundgraph.jar
```
Interactive menu-driven interface. Lets you search artists, browse charts, manage playlists, and run custom SELECT queries — all via JDBC without touching the database command line.

### Option C — Web UI manually
Terminal 1:
```bash
java -jar target/soundgraph.jar --web
```
Terminal 2:
```bash
cd frontend && npm run dev
```
Open **http://localhost:5173**

---

## Project Structure
```
db/               SQL files (schema, data, queries, triggers)
src/              Java source (CLI + REST API)
frontend/         Vite + React web interface
config.properties Database connection settings
pom.xml           Maven build
```

## SQL Queries
All queries are in `db/queries.sql`:
- **Easy**: artist search, tracks by album, playlists by user
- **Medium**: Grammy winners, multi-country chart tracks, top albums by streams
- **Hard**: genre award leaders (window functions), #1 hits with collaborators, emerging artist discovery, correlated subqueries
- **RA & TRC** examples documented as comments

## Normalization
All 11 tables are in **BCNF**. Full functional dependency analysis in the project report.
