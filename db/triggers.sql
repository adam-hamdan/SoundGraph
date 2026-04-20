-- SoundGraph Triggers and Stored Procedures
USE soundgraph;

DELIMITER $$

-- ─── TRIGGERS ────────────────────────────────────────────────────────────────

-- Trigger 1: Maintain track_count on UserPlaylist when a track is added
CREATE TRIGGER trg_playlist_track_insert
AFTER INSERT ON PlaylistTrack
FOR EACH ROW
BEGIN
    UPDATE UserPlaylist
    SET track_count = track_count + 1
    WHERE playlist_id = NEW.playlist_id;
END$$

-- Trigger 2: Maintain track_count on UserPlaylist when a track is removed
CREATE TRIGGER trg_playlist_track_delete
AFTER DELETE ON PlaylistTrack
FOR EACH ROW
BEGIN
    UPDATE UserPlaylist
    SET track_count = track_count - 1
    WHERE playlist_id = OLD.playlist_id;
END$$

-- Trigger 3: Prevent a track from being charted at the same position twice
--            in the same chart on the same date (belt-and-suspenders beyond UNIQUE key)
CREATE TRIGGER trg_chart_position_check
BEFORE INSERT ON ChartHistory
FOR EACH ROW
BEGIN
    DECLARE existing_count INT;
    SELECT COUNT(*) INTO existing_count
    FROM ChartHistory
    WHERE chart_date = NEW.chart_date
      AND country    = NEW.country
      AND chart_name = NEW.chart_name
      AND position   = NEW.position
      AND track_id  <> NEW.track_id;
    IF existing_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Position already occupied in this chart on this date';
    END IF;
END$$

-- ─── STORED PROCEDURES ───────────────────────────────────────────────────────

-- Procedure 1: Full artist report (journalist use case)
--   Returns 4 result sets: artist info, albums, award history, chart peaks
CREATE PROCEDURE GetArtistReport(IN p_artist_id INT)
BEGIN
    -- 1. Artist profile
    SELECT a.artist_id, a.name, a.country, a.debut_year, a.monthly_listeners,
           GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
    FROM Artist a
    LEFT JOIN ArtistGenre ag ON a.artist_id = ag.artist_id
    LEFT JOIN Genre g        ON ag.genre_id  = g.genre_id
    WHERE a.artist_id = p_artist_id
    GROUP BY a.artist_id;

    -- 2. Albums with total stream count
    SELECT al.album_id, al.title, al.release_date, al.total_tracks, al.label,
           COALESCE(SUM(t.stream_count), 0) AS total_streams
    FROM Album al
    LEFT JOIN Track t ON al.album_id = t.album_id
    WHERE al.artist_id = p_artist_id
    GROUP BY al.album_id
    ORDER BY al.release_date DESC;

    -- 3. Award history
    SELECT aw.award_show, aw.category, aw.year, aw.outcome,
           COALESCE(t.title, '(Artist award)') AS track_title
    FROM AwardHistory aw
    LEFT JOIN Track t ON aw.track_id = t.track_id
    WHERE aw.artist_id = p_artist_id
    ORDER BY aw.year DESC;

    -- 4. Chart peaks per track
    SELECT t.title, ch.chart_name, ch.country, MIN(ch.position) AS peak_position,
           MIN(ch.chart_date) AS first_charted
    FROM Track t
    JOIN ChartHistory ch ON t.track_id = ch.track_id
    JOIN Album al         ON t.album_id  = al.album_id
    WHERE al.artist_id = p_artist_id
    GROUP BY t.track_id, ch.chart_name, ch.country
    ORDER BY peak_position, first_charted;
END$$

-- Procedure 2: Genre chart dominance (A&R use case)
CREATE PROCEDURE GetGenreChartDominance(IN p_country VARCHAR(100))
BEGIN
    SELECT g.name AS genre,
           COUNT(ch.chart_id) AS chart_appearances,
           MIN(ch.position)   AS best_position,
           AVG(ch.position)   AS avg_position
    FROM ChartHistory ch
    JOIN Track t        ON ch.track_id  = t.track_id
    JOIN Album al       ON t.album_id   = al.album_id
    JOIN ArtistGenre ag ON al.artist_id = ag.artist_id
    JOIN Genre g        ON ag.genre_id  = g.genre_id
    WHERE ch.country = p_country
    GROUP BY g.genre_id
    ORDER BY chart_appearances DESC, avg_position ASC;
END$$

-- Procedure 3: Find emerging artists (A&R use case)
--   Debut year >= threshold, monthly listeners >= floor, fewer than p_max_awards awards
CREATE PROCEDURE GetEmergingArtists(
    IN p_debut_year_from INT,
    IN p_min_listeners   BIGINT,
    IN p_max_wins        INT
)
BEGIN
    SELECT a.artist_id, a.name, a.country, a.debut_year, a.monthly_listeners,
           COUNT(DISTINCT aw.award_id) AS award_wins,
           GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
    FROM Artist a
    LEFT JOIN AwardHistory aw ON a.artist_id = aw.artist_id AND aw.outcome = 'Won'
    LEFT JOIN ArtistGenre ag  ON a.artist_id = ag.artist_id
    LEFT JOIN Genre g         ON ag.genre_id  = g.genre_id
    WHERE a.debut_year >= p_debut_year_from
      AND a.monthly_listeners >= p_min_listeners
    GROUP BY a.artist_id
    HAVING award_wins <= p_max_wins
    ORDER BY a.monthly_listeners DESC;
END$$

DELIMITER ;
