package soundgraph.query;

import soundgraph.DBConnection;

import java.sql.*;
import java.util.*;

public class ArtistQuery {

    public List<Map<String, Object>> searchByCountry(String country) throws SQLException {
        String sql = """
            SELECT a.artist_id, a.name, a.country, a.debut_year, a.monthly_listeners,
                   GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
            FROM Artist a
            LEFT JOIN ArtistGenre ag ON a.artist_id = ag.artist_id
            LEFT JOIN Genre g        ON ag.genre_id  = g.genre_id
            WHERE a.country = ?
            GROUP BY a.artist_id
            ORDER BY a.monthly_listeners DESC
            """;
        return query(sql, country);
    }

    public List<Map<String, Object>> searchByGenre(String genre) throws SQLException {
        String sql = """
            SELECT DISTINCT a.artist_id, a.name, a.country, a.debut_year, a.monthly_listeners
            FROM Artist a
            JOIN ArtistGenre ag ON a.artist_id = ag.artist_id
            JOIN Genre g        ON ag.genre_id  = g.genre_id
            WHERE g.name LIKE ?
            ORDER BY a.monthly_listeners DESC
            """;
        return query(sql, "%" + genre + "%");
    }

    public List<Map<String, Object>> searchByName(String name) throws SQLException {
        String sql = """
            SELECT a.artist_id, a.name, a.country, a.debut_year, a.monthly_listeners,
                   GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
            FROM Artist a
            LEFT JOIN ArtistGenre ag ON a.artist_id = ag.artist_id
            LEFT JOIN Genre g        ON ag.genre_id  = g.genre_id
            WHERE a.name LIKE ?
            GROUP BY a.artist_id
            ORDER BY a.monthly_listeners DESC
            """;
        return query(sql, "%" + name + "%");
    }

    public List<Map<String, Object>> getTopByListeners(int limit) throws SQLException {
        String sql = """
            SELECT a.artist_id, a.name, a.country, a.debut_year, a.monthly_listeners,
                   GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
            FROM Artist a
            LEFT JOIN ArtistGenre ag ON a.artist_id = ag.artist_id
            LEFT JOIN Genre g        ON ag.genre_id  = g.genre_id
            GROUP BY a.artist_id
            ORDER BY a.monthly_listeners DESC
            LIMIT ?
            """;
        return query(sql, limit);
    }

    public List<Map<String, Object>> getGrammyWinners() throws SQLException {
        String sql = """
            SELECT a.name, a.country,
                   COUNT(aw.award_id) AS grammy_wins
            FROM Artist a
            JOIN AwardHistory aw ON a.artist_id = aw.artist_id
            WHERE aw.award_show LIKE '%Grammy%' AND aw.outcome = 'Won'
            GROUP BY a.artist_id
            ORDER BY grammy_wins DESC
            """;
        return query(sql);
    }

    public List<Map<String, Object>> getEmergingArtists(int debutFrom, long minListeners, int maxWins) throws SQLException {
        String sql = """
            SELECT a.name, a.country, a.debut_year, a.monthly_listeners,
                   COUNT(DISTINCT aw.award_id) AS total_wins,
                   GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
            FROM Artist a
            LEFT JOIN AwardHistory aw ON a.artist_id = aw.artist_id AND aw.outcome = 'Won'
                                    AND aw.award_show LIKE '%Grammy%'
            LEFT JOIN ArtistGenre ag  ON a.artist_id = ag.artist_id
            LEFT JOIN Genre g         ON ag.genre_id  = g.genre_id
            WHERE a.debut_year >= ? AND a.monthly_listeners >= ?
            GROUP BY a.artist_id
            HAVING total_wins <= ?
            ORDER BY a.monthly_listeners DESC
            """;
        return query(sql, debutFrom, minListeners, maxWins);
    }

    // Full artist report using stored procedure
    public List<List<Map<String, Object>>> getArtistReport(int artistId) throws SQLException {
        List<List<Map<String, Object>>> results = new ArrayList<>();
        try (CallableStatement cs = DBConnection.get().prepareCall("CALL GetArtistReport(?)")) {
            cs.setInt(1, artistId);
            boolean hasMore = cs.execute();
            while (hasMore) {
                try (ResultSet rs = cs.getResultSet()) {
                    results.add(resultSetToList(rs));
                }
                hasMore = cs.getMoreResults();
            }
        }
        return results;
    }

    private List<Map<String, Object>> query(String sql, Object... params) throws SQLException {
        try (PreparedStatement ps = DBConnection.get().prepareStatement(sql)) {
            for (int i = 0; i < params.length; i++) {
                ps.setObject(i + 1, params[i]);
            }
            try (ResultSet rs = ps.executeQuery()) {
                return resultSetToList(rs);
            }
        }
    }

    public static List<Map<String, Object>> resultSetToList(ResultSet rs) throws SQLException {
        List<Map<String, Object>> rows = new ArrayList<>();
        ResultSetMetaData meta = rs.getMetaData();
        int cols = meta.getColumnCount();
        while (rs.next()) {
            Map<String, Object> row = new LinkedHashMap<>();
            for (int i = 1; i <= cols; i++) {
                row.put(meta.getColumnLabel(i), rs.getObject(i));
            }
            rows.add(row);
        }
        return rows;
    }
}
