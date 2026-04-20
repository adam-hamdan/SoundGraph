package soundgraph.query;

import soundgraph.DBConnection;

import java.sql.*;
import java.util.*;

public class PlaylistQuery {

    public List<Map<String, Object>> getPlaylistsForUser(String username) throws SQLException {
        String sql = """
            SELECT p.playlist_id, p.name, p.created_date, p.track_count
            FROM UserPlaylist p
            JOIN User u ON p.user_id = u.user_id
            WHERE u.username = ?
            ORDER BY p.created_date DESC
            """;
        return query(sql, username);
    }

    public List<Map<String, Object>> getTracksInPlaylist(int playlistId) throws SQLException {
        String sql = """
            SELECT t.title, a.name AS artist, pt.added_date,
                   t.duration_sec, t.stream_count
            FROM PlaylistTrack pt
            JOIN Track t  ON pt.track_id   = t.track_id
            JOIN Album al ON t.album_id    = al.album_id
            JOIN Artist a ON al.artist_id  = a.artist_id
            WHERE pt.playlist_id = ?
            ORDER BY pt.added_date, t.title
            """;
        return query(sql, playlistId);
    }

    public int createPlaylist(int userId, String name) throws SQLException {
        String sql = "INSERT INTO UserPlaylist (user_id, name, created_date) VALUES (?, ?, CURDATE())";
        try (PreparedStatement ps = DBConnection.get().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, userId);
            ps.setString(2, name);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
        }
        return -1;
    }

    public void addTrackToPlaylist(int playlistId, int trackId) throws SQLException {
        String sql = "INSERT INTO PlaylistTrack (playlist_id, track_id, added_date) VALUES (?, ?, CURDATE())";
        try (PreparedStatement ps = DBConnection.get().prepareStatement(sql)) {
            ps.setInt(1, playlistId);
            ps.setInt(2, trackId);
            ps.executeUpdate();
        }
    }

    public List<Map<String, Object>> getAllUsers() throws SQLException {
        return query("SELECT user_id, username FROM User ORDER BY username");
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
