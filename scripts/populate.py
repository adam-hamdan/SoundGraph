#!/usr/bin/env python3
"""
SoundGraph database population script.
Stages:
  1 - MusicBrainz  → Artist, Album, Track, Collaboration
  2 - Grammy CSV   → AwardHistory
  3 - Billboard CSV→ ChartHistory
  4 - Last.fm      → Genre, ArtistGenre, monthly_listeners
  5 - Faker        → User, UserPlaylist, PlaylistTrack

Usage:
  python3 populate.py --all
  python3 populate.py --stage 1 --stage 4
"""

import argparse
import json
import os
import random
import re
import time
import zipfile
from datetime import date, timedelta
from pathlib import Path

import musicbrainzngs
import pymysql
import requests
from faker import Faker
from rapidfuzz import fuzz, process

# ── Config ────────────────────────────────────────────────────────────────────

DB = dict(host="localhost", port=3306, user="root", password="",
          database="soundgraph", charset="utf8mb4")

LASTFM_KEY = "fce2d0cc9b134f363117f75cea008fff"
CACHE_DIR  = Path(__file__).parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)

musicbrainzngs.set_useragent("SoundGraph", "1.0", "alvisakrasniqi@gmail.com")
musicbrainzngs.set_rate_limit(limit_or_interval=1.0)

fake = Faker()
Faker.seed(42)
random.seed(42)

# Artists to seed from MusicBrainz (MBIDs for reliable lookup)
SEED_ARTISTS = [
    ("Taylor Swift",       "20244d07-534f-4eff-b4d4-930878889970"),
    ("Drake",              "3268f062-6e76-480a-a384-e1dd2a276afb"),
    ("Billie Eilish",      "f4abc0b5-3f7a-4eff-8f78-ac078dbce533"),
    ("Bad Bunny",          "f82bcf78-5b69-4622-a5ef-73800768d9ac"),
    ("The Weeknd",         "c8b03190-306c-4120-bb0b-6f2ebfc06ea9"),
    ("Olivia Rodrigo",     "6925db17-f35e-42f3-a4eb-84ee6bf5d4b0"),
    ("BTS",                "0d79fe8e-ba27-4859-bb8c-2f255f346853"),
    ("Dua Lipa",           "6f1a58bf-9b1b-49cf-a44a-6cefad7ae04f"),
    ("Kendrick Lamar",     "381086ea-f511-4aba-bdf9-71c753dc5077"),
    ("Ariana Grande",      "f4fdbb4c-e4b7-47a0-b83b-d91bbfcfa387"),
    ("Post Malone",        "b1e26560-60e5-4236-bbdb-9aa5a8d5ee19"),
    ("SZA",                "272989c8-5535-492d-a25c-9f58803e027f"),
    ("Harry Styles",       "70248960-cb53-4ea4-943a-edb18f7d336f"),
    ("Doja Cat",           "5df62a88-cac9-490a-b62c-c7c88f4020f4"),
    ("J. Cole",            "569c0d90-28dd-413b-83e4-aaa7c27e667b"),
    ("Sabrina Carpenter",  "1882fe91-cdd9-49c9-9956-8e06a3810bd4"),
    ("Peso Pluma",         "75e4f8ef-34c3-44fd-8467-88a7d9599f77"),
    ("Mitski",             "fa58cf24-0e44-421d-8519-8bf461dcfaa5"),
    ("Lana Del Rey",       "b7539c32-53e7-4908-bda3-81449c367da6"),
    ("NewJeans",           "49204a7a-ed85-407a-828f-6fd46f1d8126"),
    ("Ed Sheeran",         "b8a7c51f-362c-4dcb-a259-bc6e0095f0a6"),
    ("Adele",              "cc2c9c3c-b7bc-4b8b-84d8-4fbd8779e493"),
    ("Beyoncé",            "859d0860-d480-4efd-970c-c05d5f1776b8"),
    ("Rihanna",            "73e5e69d-3554-40d8-8516-00cb38737a1c"),
    ("Bruno Mars",         "afb680f2-b6eb-4cd7-a70b-a63b25c763d5"),
    ("Lady Gaga",          "650e7db6-b795-4eb5-a702-5ea2fc46c848"),
    ("Justin Bieber",      "e0140a67-e4d1-4f13-8a01-364355bee46e"),
    ("Shawn Mendes",       "b7d92248-97e3-4450-8057-6fe06738f735"),
    ("Lizzo",              "8fb5370b-9568-4b61-9da5-2aa12c9928db"),
    ("Charlie Puth",       "525f1f1c-03f0-4bc8-8dfd-e7521f87631b"),
    ("The Chainsmokers",   "b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d"),
    ("Calvin Harris",      "8dd98bdc-80ec-4e93-8509-2f46bafc09a7"),
    ("Coldplay",           "cc197bad-dc9c-440d-a5b5-d52ba2e14234"),
    ("Imagine Dragons",    "012151a8-0f9a-44c9-997f-ebd68b5389f9"),
    ("Maroon 5",           "0ab49580-c84f-44d4-875f-d83760ea2cfe"),
    ("OneRepublic",        "5b11f4ce-a62d-471e-81fc-a69a8278c7da"),
    ("Panic! At The Disco","b9472588-93f3-4922-a1a2-74082cdf9ce8"),
    ("Twenty One Pilots",  "a6c6897a-7415-4f8d-b5a5-3a5e05f3be67"),
    ("Halsey",             "3377f3bb-60fc-4403-aea9-7e800612e060"),
    ("Troye Sivan",        "e5712ceb-c37a-4c49-a11c-ccf4e21852d4"),
]

# ── DB helpers ────────────────────────────────────────────────────────────────

def get_conn():
    return pymysql.connect(**DB, autocommit=False)

def fetch_existing(conn, table, col):
    with conn.cursor() as cur:
        cur.execute(f"SELECT {col} FROM {table}")
        return {r[0] for r in cur.fetchall()}

def fetch_map(conn, table, key_col, val_col):
    with conn.cursor() as cur:
        cur.execute(f"SELECT {key_col}, {val_col} FROM {table}")
        return {r[0]: r[1] for r in cur.fetchall()}

# ── Cache helpers ─────────────────────────────────────────────────────────────

def cache_path(key):
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", key)
    return CACHE_DIR / f"{safe}.json"

def cached_get(key, fetch_fn):
    p = cache_path(key)
    if p.exists():
        return json.loads(p.read_text())
    data = fetch_fn()
    p.write_text(json.dumps(data, default=str))
    return data

# ── Stage 1: MusicBrainz ──────────────────────────────────────────────────────

def mb_get_artist(mbid):
    def fetch():
        result = musicbrainzngs.get_artist_by_id(
            mbid, includes=["releases", "artist-rels"]
        )
        return result
    return cached_get(f"mb_artist_{mbid}", fetch)

def mb_get_release(mbid):
    def fetch():
        result = musicbrainzngs.get_release_by_id(
            mbid, includes=["recordings", "artist-credits", "labels"]
        )
        return result
    return cached_get(f"mb_release_{mbid}", fetch)

def stage1(conn):
    print("\n── Stage 1: MusicBrainz ─────────────────────────────────────────")

    existing_artists = fetch_map(conn, "Artist", "name", "artist_id")
    existing_albums  = fetch_map(conn, "Album",  "title", "album_id")
    existing_tracks  = fetch_map(conn, "Track",  "title", "track_id")

    inserted_artists = 0
    inserted_albums  = 0
    inserted_tracks  = 0
    inserted_collabs = 0

    for artist_name, mbid in SEED_ARTISTS:
        print(f"  Fetching {artist_name}...")
        try:
            data = mb_get_artist(mbid)
        except Exception as e:
            print(f"    [skip] {e}")
            continue

        artist = data.get("artist", {})

        # ── Insert artist ──────────────────────────────────────────────────
        if artist_name not in existing_artists:
            country    = artist.get("area", {}).get("name", "Unknown")[:100]
            begin_info = artist.get("life-span", {})
            debut_year = None
            if begin_info.get("begin"):
                try:
                    debut_year = int(str(begin_info["begin"])[:4])
                except ValueError:
                    pass
            debut_year = debut_year or 2000

            with conn.cursor() as cur:
                cur.execute(
                    "INSERT IGNORE INTO Artist (name, country, debut_year, monthly_listeners) "
                    "VALUES (%s, %s, %s, %s)",
                    (artist_name, country, debut_year, 0)
                )
            conn.commit()
            with conn.cursor() as cur:
                cur.execute("SELECT artist_id FROM Artist WHERE name=%s", (artist_name,))
                row = cur.fetchone()
            if row:
                existing_artists[artist_name] = row[0]
            inserted_artists += 1

        artist_id = existing_artists.get(artist_name)
        if not artist_id:
            continue

        # ── Insert releases (albums) ───────────────────────────────────────
        releases = artist.get("release-list", [])[:8]  # cap at 8 albums per artist
        for rel in releases:
            rel_title = rel.get("title", "").strip()
            if not rel_title or rel_title in existing_albums:
                continue
            rel_mbid = rel.get("id")
            if not rel_mbid:
                continue

            try:
                rel_data = mb_get_release(rel_mbid)
            except Exception as e:
                print(f"    [skip release] {e}")
                continue

            release = rel_data.get("release", {})
            label_list = release.get("label-info-list", [])
            label = None
            if label_list:
                label = label_list[0].get("label", {}).get("name", None)
                if label:
                    label = label[:255]

            date_str = release.get("date", "2000-01-01")
            try:
                if len(date_str) == 4:
                    release_date = date(int(date_str), 1, 1)
                elif len(date_str) == 7:
                    release_date = date(int(date_str[:4]), int(date_str[5:7]), 1)
                else:
                    release_date = date.fromisoformat(date_str[:10])
            except Exception:
                release_date = date(2000, 1, 1)

            medium_list = release.get("medium-list", [])
            recordings  = []
            for medium in medium_list:
                recordings.extend(medium.get("track-list", []))

            total_tracks = max(len(recordings), 1)

            with conn.cursor() as cur:
                cur.execute(
                    "INSERT IGNORE INTO Album (title, artist_id, release_date, total_tracks, label) "
                    "VALUES (%s, %s, %s, %s, %s)",
                    (rel_title, artist_id, release_date, total_tracks, label)
                )
            conn.commit()
            with conn.cursor() as cur:
                cur.execute("SELECT album_id FROM Album WHERE title=%s AND artist_id=%s",
                            (rel_title, artist_id))
                row = cur.fetchone()
            if not row:
                continue
            album_id = row[0]
            existing_albums[rel_title] = album_id
            inserted_albums += 1

            # ── Insert tracks ──────────────────────────────────────────────
            collab_candidates = []
            for rec in recordings[:20]:  # cap at 20 tracks per album
                recording = rec.get("recording", rec)
                track_title = recording.get("title", "").strip()
                if not track_title or track_title in existing_tracks:
                    continue

                duration_ms  = recording.get("length")
                duration_sec = int(duration_ms) // 1000 if duration_ms else random.randint(150, 300)
                duration_sec = max(duration_sec, 1)

                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT IGNORE INTO Track (title, album_id, duration_sec, explicit, stream_count) "
                        "VALUES (%s, %s, %s, %s, %s)",
                        (track_title, album_id, duration_sec, False, random.randint(100000, 500000000))
                    )
                conn.commit()
                with conn.cursor() as cur:
                    cur.execute("SELECT track_id FROM Track WHERE title=%s AND album_id=%s",
                                (track_title, album_id))
                    row = cur.fetchone()
                if row:
                    existing_tracks[track_title] = row[0]
                    inserted_tracks += 1
                    collab_candidates.append(row[0])

                # ── Collaborations from artist-credits ─────────────────────
                artist_credits = recording.get("artist-credit", [])
                featured_names = []
                for credit in artist_credits:
                    if isinstance(credit, dict) and "artist" in credit:
                        cname = credit["artist"].get("name", "")
                        if cname and cname != artist_name:
                            featured_names.append(cname)

                for fname in featured_names:
                    if fname in existing_artists:
                        a2_id   = existing_artists[fname]
                        track_id = existing_tracks.get(track_title)
                        if track_id and a2_id != artist_id:
                            a1, a2 = min(artist_id, a2_id), max(artist_id, a2_id)
                            with conn.cursor() as cur:
                                cur.execute(
                                    "INSERT IGNORE INTO Collaboration "
                                    "(artist_id_1, artist_id_2, track_id, collab_date) "
                                    "VALUES (%s, %s, %s, %s)",
                                    (a1, a2, track_id, release_date)
                                )
                            conn.commit()
                            inserted_collabs += 1

    print(f"  Done. +{inserted_artists} artists, +{inserted_albums} albums, "
          f"+{inserted_tracks} tracks, +{inserted_collabs} collaborations")

# ── Stage 2: Grammy Awards ────────────────────────────────────────────────────

def download_kaggle(dataset, filename, dest):
    dest = Path(dest)
    if dest.exists():
        print(f"  [cache] {dest.name} already downloaded")
        return
    os.environ.setdefault("KAGGLE_API_TOKEN", "KGAT_445ddb98f4fdfad734d117ea25703a02")
    import kaggle  # noqa: imported after env var set
    zip_path = CACHE_DIR / f"{filename}.zip"
    kaggle.api.authenticate()
    kaggle.api.dataset_download_files(dataset, path=str(CACHE_DIR), quiet=False)
    # find and extract
    for zp in CACHE_DIR.glob("*.zip"):
        with zipfile.ZipFile(zp) as z:
            z.extractall(CACHE_DIR)
        zp.unlink()

def fuzzy_artist_id(name, name_to_id, threshold=80):
    if not name or not name_to_id:
        return None
    match = process.extractOne(name, name_to_id.keys(), scorer=fuzz.token_sort_ratio)
    if match and match[1] >= threshold:
        return name_to_id[match[0]]
    return None

def stage2(conn):
    import pandas as pd
    print("\n── Stage 2: Grammy Awards ───────────────────────────────────────")

    csv_path = CACHE_DIR / "the_grammy_awards.csv"
    if not csv_path.exists():
        download_kaggle("unanimad/grammy-awards", "grammy_awards", csv_path)

    # retry with alternate filename
    if not csv_path.exists():
        candidates = list(CACHE_DIR.glob("*grammy*")) + list(CACHE_DIR.glob("*Grammy*"))
        if candidates:
            csv_path = candidates[0]
        else:
            print("  [skip] Grammy CSV not found after download")
            return

    df = pd.read_csv(csv_path)
    df.columns = [c.lower().strip() for c in df.columns]
    print(f"  Loaded {len(df)} Grammy rows. Columns: {list(df.columns)}")

    artist_map = fetch_map(conn, "Artist", "name", "artist_id")
    track_map  = fetch_map(conn, "Track",  "title", "track_id")

    inserted = 0
    skipped  = 0
    for _, row in df.iterrows():
        # 'artist' column = performer name(s), 'nominee' column = song/album title
        artist_raw = str(row.get("artist", "")).strip()
        nominee    = str(row.get("nominee", "")).strip()
        category   = str(row.get("category", "")).strip()[:255]
        year_raw   = row.get("year", None)
        winner     = str(row.get("winner", "false")).strip().lower()

        try:
            year = int(str(year_raw)[:4])
        except Exception:
            skipped += 1
            continue

        outcome = "Won" if winner in ("true", "1", "yes") else "Nominated"

        # artist names can be compound: "Post Malone & Swae Lee", "A Featuring B"
        artist_id = None
        for sep in [" & ", " Featuring ", " feat. ", " ft. ", " x ", " / "]:
            if sep.lower() in artist_raw.lower():
                parts = re.split(sep, artist_raw, flags=re.IGNORECASE)
                for part in parts:
                    artist_id = fuzzy_artist_id(part.strip(), artist_map, threshold=75)
                    if artist_id:
                        break
                if artist_id:
                    break
        if not artist_id:
            artist_id = fuzzy_artist_id(artist_raw, artist_map, threshold=75)

        # match track by nominee title
        track_id = None
        if nominee in track_map:
            track_id = track_map[nominee]
        else:
            best = process.extractOne(nominee, track_map.keys(), scorer=fuzz.token_sort_ratio)
            if best and best[1] >= 88:
                track_id = track_map[best[0]]

        if artist_id is None and track_id is None:
            skipped += 1
            continue

        with conn.cursor() as cur:
            cur.execute(
                "INSERT IGNORE INTO AwardHistory (artist_id, track_id, award_show, category, year, outcome) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (artist_id, track_id, "Grammy Awards", category, year, outcome)
            )
        inserted += 1

    conn.commit()
    print(f"  Done. +{inserted} award rows ({skipped} unmatched/skipped)")

# ── Stage 3: Billboard Hot 100 ────────────────────────────────────────────────

def stage3(conn):
    import pandas as pd
    print("\n── Stage 3: Billboard Hot 100 ───────────────────────────────────")

    csv_path = CACHE_DIR / "charts.csv"
    if not csv_path.exists():
        download_kaggle("dhruvildave/billboard-the-hot-100-songs", "charts", csv_path)

    if not csv_path.exists():
        candidates = list(CACHE_DIR.glob("*hot*100*")) + list(CACHE_DIR.glob("*billboard*"))
        if candidates:
            csv_path = candidates[0]
        else:
            print("  [skip] Billboard CSV not found after download")
            return

    df = pd.read_csv(csv_path, parse_dates=["date"])
    df.columns = [c.lower().strip() for c in df.columns]
    print(f"  Loaded {len(df)} Billboard rows")

    # Only keep entries for tracks already in our DB
    track_map = fetch_map(conn, "Track", "title", "track_id")

    # Filter to songs we know about via fuzzy match
    matched_rows = []
    for _, row in df.iterrows():
        song = str(row.get("song", "")).strip()
        if song in track_map:
            matched_rows.append((track_map[song], row))
        else:
            best = process.extractOne(song, track_map.keys(), scorer=fuzz.token_sort_ratio)
            if best and best[1] >= 90:
                matched_rows.append((track_map[best[0]], row))

    print(f"  Matched {len(matched_rows)} chart entries to known tracks")

    # International charts derived from US position with realistic offsets.
    # Billboard Hot 100 is US-only; other countries use their own chart names.
    INTL_CHARTS = [
        ("UK",        "UK Singles Chart",      4),
        ("Australia", "ARIA Chart",             5),
        ("Canada",    "Canadian Hot 100",       3),
        ("Germany",   "GfK Entertainment",      7),
    ]

    # Pass 1: insert all US entries
    us_entries = []
    inserted = 0
    for track_id, row in matched_rows:
        try:
            chart_date = row["date"]
            if hasattr(chart_date, "date"):
                chart_date = chart_date.date()
            position = int(row.get("rank", row.get("position", 0)))
            if not (1 <= position <= 100):
                continue
        except Exception:
            continue

        with conn.cursor() as cur:
            cur.execute(
                "INSERT IGNORE INTO ChartHistory (track_id, chart_date, country, position, chart_name) "
                "VALUES (%s, %s, %s, %s, %s)",
                (track_id, chart_date, "USA", position, "Billboard Hot 100")
            )
        inserted += 1
        if position <= 40:
            us_entries.append((track_id, chart_date, position))

    conn.commit()

    # Pass 2: international entries for top-40 US tracks (committed separately)
    for track_id, chart_date, position in us_entries:
        for country, chart_name, max_offset in INTL_CHARTS:
            offset = random.randint(-3, max_offset)
            intl_pos = max(1, min(100, position + offset))
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT IGNORE INTO ChartHistory (track_id, chart_date, country, position, chart_name) "
                        "VALUES (%s, %s, %s, %s, %s)",
                        (track_id, chart_date, country, intl_pos, chart_name)
                    )
                conn.commit()
                inserted += 1
            except Exception:
                conn.rollback()

    print(f"  Done. +{inserted} chart entries (USA + UK, Australia, Canada, Germany for top-40 tracks)")

# ── Stage 4: Last.fm genres + listener counts ─────────────────────────────────

LASTFM_BASE = "https://ws.audioscrobbler.com/2.0/"

def lastfm_get(method, params):
    key = f"lastfm_{method}_{'_'.join(str(v) for v in params.values())}"
    def fetch():
        p = {"method": method, "api_key": LASTFM_KEY, "format": "json", **params}
        r = requests.get(LASTFM_BASE, params=p, timeout=10)
        r.raise_for_status()
        return r.json()
    return cached_get(key, fetch)

def stage4(conn):
    print("\n── Stage 4: Last.fm genres + listeners ──────────────────────────")

    artist_map  = fetch_map(conn, "Artist", "name", "artist_id")
    genre_map   = fetch_map(conn, "Genre",  "name", "genre_id")

    updated_listeners = 0
    inserted_genres   = 0
    inserted_ag       = 0

    for artist_name, artist_id in artist_map.items():
        try:
            data = lastfm_get("artist.getInfo", {"artist": artist_name})
        except Exception as e:
            print(f"  [skip] {artist_name}: {e}")
            continue

        info = data.get("artist", {})

        # Update monthly_listeners from Last.fm listener count
        listeners = info.get("stats", {}).get("listeners")
        if listeners:
            with conn.cursor() as cur:
                cur.execute("UPDATE Artist SET monthly_listeners=%s WHERE artist_id=%s",
                            (int(listeners), artist_id))
            updated_listeners += 1

        # Insert genres from Last.fm tags
        tags = info.get("tags", {}).get("tag", [])
        if isinstance(tags, dict):
            tags = [tags]

        for tag in tags[:3]:
            tag_name = tag.get("name", "").strip().title()[:100]
            if not tag_name:
                continue
            if tag_name not in genre_map:
                with conn.cursor() as cur:
                    cur.execute("INSERT IGNORE INTO Genre (name) VALUES (%s)", (tag_name,))
                conn.commit()
                with conn.cursor() as cur:
                    cur.execute("SELECT genre_id FROM Genre WHERE name=%s", (tag_name,))
                    row = cur.fetchone()
                if row:
                    genre_map[tag_name] = row[0]
                    inserted_genres += 1

            genre_id = genre_map.get(tag_name)
            if genre_id:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT IGNORE INTO ArtistGenre (artist_id, genre_id) VALUES (%s, %s)",
                        (artist_id, genre_id)
                    )
                inserted_ag += 1

        time.sleep(0.25)  # Last.fm allows 5 req/sec on free tier

    conn.commit()
    print(f"  Done. Updated {updated_listeners} listener counts, "
          f"+{inserted_genres} genres, +{inserted_ag} artist-genre links")

# ── Stage 5: Faker — User, UserPlaylist, PlaylistTrack ────────────────────────

def stage5(conn):
    print("\n── Stage 5: Faker synthetic users ───────────────────────────────")

    existing_usernames = fetch_existing(conn, "User", "username")
    track_ids = list(fetch_existing(conn, "Track", "track_id"))
    if not track_ids:
        print("  [skip] No tracks in DB yet — run stage 1 first")
        return

    # Insert users
    new_users = []
    for _ in range(100):
        username = fake.user_name()[:100]
        if username not in existing_usernames:
            with conn.cursor() as cur:
                cur.execute("INSERT IGNORE INTO User (username) VALUES (%s)", (username,))
            existing_usernames.add(username)
            new_users.append(username)

    conn.commit()
    user_map = fetch_map(conn, "User", "username", "user_id")

    # Insert playlists + tracks
    playlist_names = [
        "Late Night Drive", "Morning Coffee", "Gym Hits", "Study Mode",
        "Party Starters", "Throwback Anthems", "Chill Sunday", "Road Trip",
        "Sad Hours", "Hype Train", "Golden Era", "Top Charts", "Focus Flow",
        "BBQ Vibes", "Rainy Day", "Feel Good Mix", "Indie Gems", "Global Hits",
        "Summer 2024", "Workout Fuel",
    ]

    inserted_playlists = 0
    inserted_pt        = 0

    for username in new_users[:80]:
        user_id     = user_map.get(username)
        if not user_id:
            continue
        num_playlists = random.randint(1, 4)
        for _ in range(num_playlists):
            pl_name    = random.choice(playlist_names) + " " + fake.word().title()
            created    = fake.date_between(start_date=date(2020, 1, 1), end_date=date.today())
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO UserPlaylist (user_id, name, created_date, track_count) "
                    "VALUES (%s, %s, %s, 0)",
                    (user_id, pl_name[:255], created)
                )
                playlist_id = cur.lastrowid
            conn.commit()
            inserted_playlists += 1

            # Add 5–20 random tracks
            chosen = random.sample(track_ids, min(random.randint(5, 20), len(track_ids)))
            for track_id in chosen:
                added = fake.date_between(start_date=created, end_date=date.today())
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT IGNORE INTO PlaylistTrack (playlist_id, track_id, added_date) "
                        "VALUES (%s, %s, %s)",
                        (playlist_id, track_id, added)
                    )
                inserted_pt += 1

    conn.commit()

    # Sync track_count via trigger-safe UPDATE
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE UserPlaylist p
            SET track_count = (
                SELECT COUNT(*) FROM PlaylistTrack pt WHERE pt.playlist_id = p.playlist_id
            )
        """)
    conn.commit()

    print(f"  Done. +{len(new_users)} users, +{inserted_playlists} playlists, +{inserted_pt} playlist tracks")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="SoundGraph data population")
    parser.add_argument("--all", action="store_true", help="Run all stages")
    parser.add_argument("--stage", type=int, action="append", dest="stages",
                        help="Run specific stage(s)")
    args = parser.parse_args()

    stages = set(args.stages or [])
    if args.all:
        stages = {1, 2, 3, 4, 5}

    if not stages:
        parser.print_help()
        return

    conn = get_conn()
    try:
        if 1 in stages:
            stage1(conn)
        if 2 in stages:
            stage2(conn)
        if 3 in stages:
            stage3(conn)
        if 4 in stages:
            stage4(conn)
        if 5 in stages:
            stage5(conn)
    finally:
        conn.close()

    print("\n✓ Population complete.")

if __name__ == "__main__":
    main()
