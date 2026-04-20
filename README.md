# SoundGraph — Music Ecosystem & Trend Analytics Platform

CSDS 341 Spring 2026 Final Project  
Team: Alvisa Krasniqi, Adam Hamdan, Eva-Jessy Ouach, Robert Beletsky

## Tech Stack
- **DBMS**: MySQL 8.x
- **Backend/CLI**: Java 17 + JDBC
- **Web UI**: Vite + React + Tailwind CSS
- **Build**: Maven

---

## Setup

### 1. Database
```bash
# Create schema and load data
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

### 3. Build Java
```bash
mvn package
```

### 4. Run CLI
```bash
java -jar target/soundgraph.jar
```

### 5. Run Web UI
In one terminal:
```bash
java -jar target/soundgraph.jar --web
```

In another:
```bash
cd frontend && npm install && npm run dev
```

Open http://localhost:5173

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
