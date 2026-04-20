package soundgraph;

import soundgraph.query.*;

import java.sql.*;
import java.util.*;

public class CLI {
    private final Scanner scanner = new Scanner(System.in);
    private final ArtistQuery artistQ = new ArtistQuery();
    private final TrackQuery trackQ = new TrackQuery();
    private final ChartQuery chartQ = new ChartQuery();
    private final PlaylistQuery playlistQ = new PlaylistQuery();

    public void run() {
        System.out.println("""
            ╔══════════════════════════════════════════╗
            ║   SoundGraph — Music Analytics Platform  ║
            ╚══════════════════════════════════════════╝
            """);
        while (true) {
            printMainMenu();
            int choice = readInt("Choice: ");
            try {
                switch (choice) {
                    case 1 -> searchArtists();
                    case 2 -> artistReport();
                    case 3 -> emergingArtists();
                    case 4 -> playlists();
                    case 5 -> chartBrowser();
                    case 6 -> trackSearch();
                    case 7 -> customQuery();
                    case 0 -> { System.out.println("Goodbye!"); return; }
                    default -> System.out.println("Invalid option.");
                }
            } catch (SQLException e) {
                System.err.println("Database error: " + e.getMessage());
            }
        }
    }

    private void printMainMenu() {
        System.out.println("""
            ─────────────────────────────────────────
            1. Search artists (by name / country / genre)
            2. Artist full report  [journalist]
            3. Find emerging artists  [A&R]
            4. Playlists  [casual fan]
            5. Chart browser
            6. Search tracks
            7. Run custom SQL
            0. Exit
            ─────────────────────────────────────────""");
    }

    private void searchArtists() throws SQLException {
        System.out.println("Search by: [1] Name  [2] Country  [3] Genre");
        int choice = readInt("Choice: ");
        List<Map<String, Object>> results = switch (choice) {
            case 1 -> { String name = readLine("Artist name: "); yield artistQ.searchByName(name); }
            case 2 -> { String country = readLine("Country: "); yield artistQ.searchByCountry(country); }
            case 3 -> { String genre = readLine("Genre: "); yield artistQ.searchByGenre(genre); }
            default -> { System.out.println("Invalid."); yield List.of(); }
        };
        printTable(results);
    }

    private void artistReport() throws SQLException {
        String name = readLine("Artist name (or partial): ");
        List<Map<String, Object>> matches = artistQ.searchByName(name);
        if (matches.isEmpty()) { System.out.println("No artists found."); return; }
        printTable(matches);
        int id = readInt("Enter artist_id for full report: ");
        List<List<Map<String, Object>>> report = artistQ.getArtistReport(id);
        String[] sections = {"─── PROFILE ───", "─── ALBUMS ───", "─── AWARDS ───", "─── CHART PEAKS ───"};
        for (int i = 0; i < report.size(); i++) {
            System.out.println("\n" + (i < sections.length ? sections[i] : "─── SECTION " + (i+1) + " ───"));
            printTable(report.get(i));
        }
    }

    private void emergingArtists() throws SQLException {
        System.out.println("Find emerging artists (debuted recently, growing audience)");
        int year = readInt("Debut year from (e.g. 2018): ");
        long listeners = readLong("Min monthly listeners (e.g. 5000000): ");
        int wins = readInt("Max Grammy wins (e.g. 1): ");
        printTable(artistQ.getEmergingArtists(year, listeners, wins));
    }

    private void playlists() throws SQLException {
        System.out.println("[1] View my playlists  [2] Create playlist  [3] Add track to playlist");
        int choice = readInt("Choice: ");
        switch (choice) {
            case 1 -> {
                String username = readLine("Username: ");
                List<Map<String, Object>> playlists = playlistQ.getPlaylistsForUser(username);
                printTable(playlists);
                if (!playlists.isEmpty()) {
                    int pid = readInt("Enter playlist_id to see tracks (0 to skip): ");
                    if (pid != 0) printTable(playlistQ.getTracksInPlaylist(pid));
                }
            }
            case 2 -> {
                printTable(playlistQ.getAllUsers());
                int uid = readInt("Your user_id: ");
                String pname = readLine("Playlist name: ");
                int pid = playlistQ.createPlaylist(uid, pname);
                System.out.println("Created playlist id=" + pid);
            }
            case 3 -> {
                int pid = readInt("Playlist id: ");
                int tid = readInt("Track id: ");
                playlistQ.addTrackToPlaylist(pid, tid);
                System.out.println("Track added!");
            }
        }
    }

    private void chartBrowser() throws SQLException {
        System.out.println("[1] Charts by country  [2] Genre dominance by country  [3] #1 hits");
        int choice = readInt("Choice: ");
        switch (choice) {
            case 1 -> { String c = readLine("Country: "); printTable(chartQ.getChartsByCountry(c)); }
            case 2 -> { String c = readLine("Country: "); printTable(chartQ.getGenreDominanceByCountry(c)); }
            case 3 -> printTable(trackQ.getNumberOneHits());
        }
    }

    private void trackSearch() throws SQLException {
        System.out.println("[1] Search by title  [2] Top streamed  [3] Multi-country charted");
        int choice = readInt("Choice: ");
        switch (choice) {
            case 1 -> { String t = readLine("Track title: "); printTable(trackQ.searchTracks(t)); }
            case 2 -> printTable(trackQ.getTopStreamedTracks(20));
            case 3 -> printTable(trackQ.getTracksChartedMultiCountry());
        }
    }

    private void customQuery() throws SQLException {
        System.out.println("Enter SQL query (single line, SELECT only for safety):");
        String sql = readLine("> ");
        if (!sql.trim().toUpperCase().startsWith("SELECT")) {
            System.out.println("Only SELECT queries are allowed.");
            return;
        }
        try (Statement st = DBConnection.get().createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            printTable(ArtistQuery.resultSetToList(rs));
        }
    }

    // ─── Printing ───────────────────────────────────────────────────────────

    private void printTable(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            System.out.println("(no results)");
            return;
        }
        List<String> cols = new ArrayList<>(rows.get(0).keySet());
        int[] widths = new int[cols.size()];
        for (int i = 0; i < cols.size(); i++) widths[i] = cols.get(i).length();
        for (Map<String, Object> row : rows) {
            for (int i = 0; i < cols.size(); i++) {
                Object v = row.get(cols.get(i));
                if (v != null) widths[i] = Math.max(widths[i], v.toString().length());
            }
        }
        String sep = buildSep(widths);
        System.out.println(sep);
        System.out.print("|");
        for (int i = 0; i < cols.size(); i++) System.out.printf(" %-" + widths[i] + "s |", cols.get(i));
        System.out.println();
        System.out.println(sep);
        for (Map<String, Object> row : rows) {
            System.out.print("|");
            for (int i = 0; i < cols.size(); i++) {
                Object v = row.get(cols.get(i));
                System.out.printf(" %-" + widths[i] + "s |", v == null ? "" : v.toString());
            }
            System.out.println();
        }
        System.out.println(sep);
        System.out.println("(" + rows.size() + " row" + (rows.size() == 1 ? "" : "s") + ")");
    }

    private String buildSep(int[] widths) {
        StringBuilder sb = new StringBuilder("+");
        for (int w : widths) sb.append("-".repeat(w + 2)).append("+");
        return sb.toString();
    }

    // ─── Input helpers ───────────────────────────────────────────────────────

    private int readInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            try { return Integer.parseInt(scanner.nextLine().trim()); }
            catch (NumberFormatException e) { System.out.println("Please enter a number."); }
        }
    }

    private long readLong(String prompt) {
        while (true) {
            System.out.print(prompt);
            try { return Long.parseLong(scanner.nextLine().trim()); }
            catch (NumberFormatException e) { System.out.println("Please enter a number."); }
        }
    }

    private String readLine(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }
}
