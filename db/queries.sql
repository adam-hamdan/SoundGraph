-- SoundGraph Query Library
-- CSDS 341 Spring 2026
-- Organized by difficulty: Easy → Medium → Hard
-- Each query includes SQL, Relational Algebra (RA), and/or Tuple Relational Calculus (TRC) where noted
USE soundgraph;

-- ═══════════════════════════════════════════════════════════════════════════════
-- EASY QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Q1: All artists from a given country
-- RA: σ(country='USA')(Artist)
-- TRC: { t | Artist(t) ∧ t.country = 'USA' }
SELECT artist_id, name, country, debut_year, monthly_listeners
FROM Artist
WHERE country = 'USA'
ORDER BY monthly_listeners DESC;

-- Q2: All tracks on a given album (by album title)
-- RA: π(track_id,title,duration_sec,stream_count)( σ(title='Midnights')(Album) ⋈ Track )
-- TRC: { t | ∃a(Album(a) ∧ a.title='Midnights' ∧ Track(t) ∧ t.album_id=a.album_id) }
SELECT t.track_id, t.title, t.duration_sec, t.explicit, t.stream_count
FROM Track t
JOIN Album a ON t.album_id = a.album_id
WHERE a.title = 'Midnights'
ORDER BY t.track_id;

-- Q3: All playlists for a given user (by username)
SELECT p.playlist_id, p.name, p.created_date, p.track_count
FROM UserPlaylist p
JOIN User u ON p.user_id = u.user_id
WHERE u.username = 'fan_casey'
ORDER BY p.created_date DESC;

-- Q4: All genres and their parent genre name
SELECT g.genre_id, g.name AS genre,
       COALESCE(parent.name, '(root)') AS parent_genre
FROM Genre g
LEFT JOIN Genre parent ON g.parent_genre_id = parent.genre_id
ORDER BY parent.name, g.name;

-- Q5: All tracks that are explicit
SELECT t.title, a.name AS artist, al.title AS album
FROM Track t
JOIN Album al  ON t.album_id  = al.album_id
JOIN Artist a  ON al.artist_id = a.artist_id
WHERE t.explicit = TRUE
ORDER BY t.stream_count DESC;


-- ═══════════════════════════════════════════════════════════════════════════════
-- MEDIUM QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Q6: Top 10 artists by monthly listeners with their primary genre
-- RA: π(name,monthly_listeners,genre)( Artist ⋈ ArtistGenre ⋈ Genre ) [top 10]
SELECT a.name, a.country, a.monthly_listeners,
       GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
FROM Artist a
LEFT JOIN ArtistGenre ag ON a.artist_id = ag.artist_id
LEFT JOIN Genre g        ON ag.genre_id  = g.genre_id
GROUP BY a.artist_id
ORDER BY a.monthly_listeners DESC
LIMIT 10;

-- Q7: Artists who have WON (not just nominated) a Grammy Award
SELECT DISTINCT a.name, a.country,
       COUNT(aw.award_id) AS grammy_wins
FROM Artist a
JOIN AwardHistory aw ON a.artist_id = aw.artist_id
WHERE aw.award_show LIKE '%Grammy%'
  AND aw.outcome = 'Won'
GROUP BY a.artist_id
ORDER BY grammy_wins DESC;

-- Q8: Tracks that have charted in more than 2 different countries
SELECT t.title, art.name AS artist,
       COUNT(DISTINCT ch.country) AS countries_charted,
       MIN(ch.position) AS best_position
FROM Track t
JOIN ChartHistory ch ON t.track_id  = ch.track_id
JOIN Album al        ON t.album_id   = al.album_id
JOIN Artist art      ON al.artist_id = art.artist_id
GROUP BY t.track_id
HAVING COUNT(DISTINCT ch.country) > 2
ORDER BY countries_charted DESC, best_position;

-- Q9: Albums with their total stream count, ordered by streams
SELECT al.title AS album, a.name AS artist,
       al.release_date, al.total_tracks,
       SUM(t.stream_count) AS total_streams
FROM Album al
JOIN Artist a ON al.artist_id = a.artist_id
JOIN Track t  ON al.album_id  = t.album_id
GROUP BY al.album_id
ORDER BY total_streams DESC;

-- Q10: Collaborations with both artist names and the track they collaborated on
SELECT a1.name AS artist_1, a2.name AS artist_2,
       t.title AS track, c.collab_date
FROM Collaboration c
JOIN Artist a1 ON c.artist_id_1 = a1.artist_id
JOIN Artist a2 ON c.artist_id_2 = a2.artist_id
JOIN Track  t  ON c.track_id    = t.track_id
ORDER BY c.collab_date DESC;


-- ═══════════════════════════════════════════════════════════════════════════════
-- HARD QUERIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Q11: For each genre, the artist with the most award WINS
WITH ArtistWins AS (
    SELECT ag.genre_id, aw.artist_id,
           COUNT(*) AS win_count
    FROM AwardHistory aw
    JOIN ArtistGenre ag ON aw.artist_id = ag.artist_id
    WHERE aw.outcome = 'Won'
    GROUP BY ag.genre_id, aw.artist_id
),
RankedWins AS (
    SELECT genre_id, artist_id, win_count,
           RANK() OVER (PARTITION BY genre_id ORDER BY win_count DESC) AS rnk
    FROM ArtistWins
)
SELECT g.name AS genre, a.name AS top_artist, rw.win_count
FROM RankedWins rw
JOIN Genre  g ON rw.genre_id  = g.genre_id
JOIN Artist a ON rw.artist_id = a.artist_id
WHERE rw.rnk = 1
ORDER BY g.name;

-- Q12: Tracks that peaked at #1 on Billboard Hot 100, with any collaborating artists
SELECT t.title, art.name AS primary_artist,
       MIN(ch.chart_date) AS first_number_one,
       GROUP_CONCAT(DISTINCT
           CASE WHEN c.artist_id_1 = al.artist_id THEN a2.name ELSE a1.name END
           ORDER BY 1 SEPARATOR ', '
       ) AS featured_artists
FROM Track t
JOIN ChartHistory ch ON t.track_id   = ch.track_id
JOIN Album al        ON t.album_id   = al.album_id
JOIN Artist art      ON al.artist_id = art.artist_id
LEFT JOIN Collaboration c ON t.track_id = c.track_id
LEFT JOIN Artist a1       ON c.artist_id_1 = a1.artist_id
LEFT JOIN Artist a2       ON c.artist_id_2 = a2.artist_id
WHERE ch.chart_name = 'Billboard Hot 100'
  AND ch.position   = 1
GROUP BY t.track_id
ORDER BY first_number_one DESC;

-- Q13: The journalist query — full report for a given artist (Taylor Swift, artist_id=1)
--      Collaborators, award history, and chart peaks in one result
SELECT 'COLLABORATORS' AS section,
       CASE WHEN c.artist_id_1 = 1 THEN a.name ELSE a.name END AS name,
       t.title AS context,
       CAST(c.collab_date AS CHAR) AS detail
FROM Collaboration c
JOIN Artist a ON (c.artist_id_1 = 1 AND a.artist_id = c.artist_id_2)
             OR (c.artist_id_2 = 1 AND a.artist_id = c.artist_id_1)
JOIN Track  t ON c.track_id = t.track_id

UNION ALL

SELECT 'AWARDS' AS section,
       aw.award_show AS name,
       aw.category   AS context,
       CONCAT(aw.year, ' - ', aw.outcome) AS detail
FROM AwardHistory aw
WHERE aw.artist_id = 1

UNION ALL

SELECT 'CHART PEAKS' AS section,
       ch.chart_name AS name,
       t.title       AS context,
       CONCAT(ch.country, ' #', MIN(ch.position)) AS detail
FROM Track t
JOIN ChartHistory ch ON t.track_id = ch.track_id
JOIN Album al         ON t.album_id = al.album_id
WHERE al.artist_id = 1
GROUP BY t.track_id, ch.chart_name, ch.country
ORDER BY section, detail;

-- Q14: A&R Query — Emerging artists: debuted 2018+, 10M+ listeners, ≤1 Grammy win
SELECT a.name, a.country, a.debut_year, a.monthly_listeners,
       COUNT(DISTINCT aw.award_id) AS total_wins,
       GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
FROM Artist a
LEFT JOIN AwardHistory aw ON a.artist_id = aw.artist_id
                         AND aw.outcome = 'Won'
                         AND aw.award_show LIKE '%Grammy%'
LEFT JOIN ArtistGenre ag  ON a.artist_id = ag.artist_id
LEFT JOIN Genre g         ON ag.genre_id  = g.genre_id
WHERE a.debut_year >= 2018
  AND a.monthly_listeners >= 10000000
GROUP BY a.artist_id
HAVING total_wins <= 1
ORDER BY a.monthly_listeners DESC;

-- Q15: Correlated subquery — artists whose monthly listeners exceed
--      the average for their country
SELECT a.name, a.country, a.monthly_listeners,
       (SELECT AVG(a2.monthly_listeners)
        FROM Artist a2
        WHERE a2.country = a.country) AS country_avg
FROM Artist a
WHERE a.monthly_listeners > (
    SELECT AVG(a3.monthly_listeners)
    FROM Artist a3
    WHERE a3.country = a.country
)
ORDER BY a.country, a.monthly_listeners DESC;

-- Q16: Window function — rank tracks by stream count within each album
SELECT al.title AS album, t.title AS track, t.stream_count,
       RANK() OVER (PARTITION BY al.album_id ORDER BY t.stream_count DESC) AS rank_in_album
FROM Track t
JOIN Album al ON t.album_id = al.album_id
ORDER BY al.title, rank_in_album;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RELATIONAL ALGEBRA (RA) EXAMPLES — documented as comments
-- ═══════════════════════════════════════════════════════════════════════════════
/*
Q1 RA:
  σ(country='USA')(Artist)

Q6 RA (Top artists with genre):
  π(name, monthly_listeners, genre)(
    Artist ⋈[artist_id] ArtistGenre ⋈[genre_id] Genre
  )
  [then sort and limit 10 in application layer]

Q8 RA (Tracks charted in >2 countries):
  Let R = π(track_id, country)(ChartHistory)
  Let GroupCount = GROUPBY(track_id, COUNT(country))(R)
  σ(count > 2)(GroupCount) ⋈ Track ⋈ Album ⋈ Artist
*/

-- ═══════════════════════════════════════════════════════════════════════════════
-- TUPLE RELATIONAL CALCULUS (TRC) EXAMPLES — documented as comments
-- ═══════════════════════════════════════════════════════════════════════════════
/*
Q1 TRC (Artists from USA):
  { t | Artist(t) ∧ t.country = 'USA' }

Q7 TRC (Grammy winners):
  { t | Artist(t) ∧ ∃a(AwardHistory(a) ∧ a.artist_id = t.artist_id
         ∧ a.award_show = 'Grammy Awards' ∧ a.outcome = 'Won') }

Q8 TRC (Tracks charted in > 2 countries):
  { t | Track(t) ∧ ∃c1∃c2∃c3(
      ChartHistory(c1) ∧ ChartHistory(c2) ∧ ChartHistory(c3)
      ∧ c1.track_id = t.track_id ∧ c2.track_id = t.track_id ∧ c3.track_id = t.track_id
      ∧ c1.country ≠ c2.country ∧ c1.country ≠ c3.country ∧ c2.country ≠ c3.country
  ) }
*/
