package soundgraph.query;

import soundgraph.DBConnection;

import java.sql.*;
import java.util.*;

public class ChartQuery {

    public List<Map<String, Object>> getChartsByCountry(String country) throws SQLException {
        String sql = """
            SELECT ch.chart_date, ch.position, t.title AS track,
                   a.name AS artist, ch.chart_name
            FROM ChartHistory ch
            JOIN Track t  ON ch.track_id   = t.track_id
            JOIN Album al ON t.album_id    = al.album_id
            JOIN Artist a ON al.artist_id  = a.artist_id
            WHERE ch.country = ?
            ORDER BY ch.chart_date DESC, ch.position
            """;
        return query(sql, country);
    }

    public List<Map<String, Object>> getGenreDominanceByCountry(String country) throws SQLException {
        String sql = """
            SELECT g.name AS genre,
                   COUNT(ch.chart_id) AS chart_appearances,
                   MIN(ch.position)   AS best_position,
                   AVG(ch.position)   AS avg_position
            FROM ChartHistory ch
            JOIN Track t        ON ch.track_id  = t.track_id
            JOIN Album al       ON t.album_id   = al.album_id
            JOIN ArtistGenre ag ON al.artist_id = ag.artist_id
            JOIN Genre g        ON ag.genre_id  = g.genre_id
            WHERE ch.country = ?
            GROUP BY g.genre_id
            ORDER BY chart_appearances DESC, avg_position ASC
            """;
        return query(sql, country);
    }

    public List<Map<String, Object>> getChartPeaksForArtist(int artistId) throws SQLException {
        String sql = """
            SELECT t.title, ch.chart_name, ch.country,
                   MIN(ch.position) AS peak_position,
                   MIN(ch.chart_date) AS first_charted
            FROM Track t
            JOIN ChartHistory ch ON t.track_id  = ch.track_id
            JOIN Album al        ON t.album_id   = al.album_id
            WHERE al.artist_id = ?
            GROUP BY t.track_id, ch.chart_name, ch.country
            ORDER BY peak_position, first_charted
            """;
        return query(sql, artistId);
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
