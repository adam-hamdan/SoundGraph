package soundgraph.query;

import soundgraph.DBConnection;

import java.sql.*;
import java.util.*;

public class TrackQuery {

    public List<Map<String, Object>> getTracksByAlbum(String albumTitle) throws SQLException {
        String sql = """
            SELECT t.track_id, t.title, t.duration_sec, t.explicit, t.stream_count
            FROM Track t
            JOIN Album a ON t.album_id = a.album_id
            WHERE a.title LIKE ?
            ORDER BY t.track_id
            """;
        return query(sql, "%" + albumTitle + "%");
    }

    public List<Map<String, Object>> searchTracks(String title) throws SQLException {
        String sql = """
            SELECT t.track_id, t.title, a.name AS artist, al.title AS album,
                   t.duration_sec, t.explicit, t.stream_count
            FROM Track t
            JOIN Album al  ON t.album_id   = al.album_id
            JOIN Artist a  ON al.artist_id  = a.artist_id
            WHERE t.title LIKE ?
            ORDER BY t.stream_count DESC
            """;
        return query(sql, "%" + title + "%");
    }

    public List<Map<String, Object>> getNumberOneHits() throws SQLException {
        String sql = """
            SELECT t.title, art.name AS artist,
                   MIN(ch.chart_date) AS first_number_one,
                   ch.chart_name, ch.country
            FROM Track t
            JOIN ChartHistory ch ON t.track_id   = ch.track_id
            JOIN Album al        ON t.album_id   = al.album_id
            JOIN Artist art      ON al.artist_id = art.artist_id
            WHERE ch.chart_name = 'Billboard Hot 100' AND ch.position = 1
            GROUP BY t.track_id, ch.chart_name, ch.country
            ORDER BY first_number_one DESC
            """;
        return query(sql);
    }

    public List<Map<String, Object>> getTracksChartedMultiCountry() throws SQLException {
        String sql = """
            SELECT t.title, art.name AS artist,
                   COUNT(DISTINCT ch.country) AS countries_charted,
                   MIN(ch.position) AS best_position
            FROM Track t
            JOIN ChartHistory ch ON t.track_id   = ch.track_id
            JOIN Album al        ON t.album_id   = al.album_id
            JOIN Artist art      ON al.artist_id = art.artist_id
            GROUP BY t.track_id
            HAVING COUNT(DISTINCT ch.country) > 2
            ORDER BY countries_charted DESC, best_position
            """;
        return query(sql);
    }

    public List<Map<String, Object>> getTopStreamedTracks(int limit) throws SQLException {
        String sql = """
            SELECT t.title, a.name AS artist, al.title AS album,
                   t.stream_count
            FROM Track t
            JOIN Album al ON t.album_id = al.album_id
            JOIN Artist a ON al.artist_id = a.artist_id
            ORDER BY t.stream_count DESC
            LIMIT ?
            """;
        return query(sql, limit);
    }

    private List<Map<String, Object>> query(String sql, Object... params) throws SQLException {
        try (PreparedStatement ps = DBConnection.get().prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            try (ResultSet rs = ps.executeQuery()) {
                return ArtistQuery.resultSetToList(rs);
            }
        }
    }
}
