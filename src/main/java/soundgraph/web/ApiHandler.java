package soundgraph.web;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import soundgraph.query.*;

import java.io.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;
import java.util.*;

public class ApiHandler implements HttpHandler {
    private static final Gson GSON = new GsonBuilder().serializeNulls().create();
    private final ArtistQuery artistQ = new ArtistQuery();
    private final TrackQuery trackQ = new TrackQuery();
    private final ChartQuery chartQ = new ChartQuery();
    private final PlaylistQuery playlistQ = new PlaylistQuery();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // CORS headers
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        URI uri = exchange.getRequestURI();
        String path = uri.getPath().replaceFirst("^/api", "");
        Map<String, String> params = parseQuery(uri.getRawQuery());

        try {
            Object result = route(path, params);
            sendJson(exchange, 200, result);
        } catch (IllegalArgumentException e) {
            sendJson(exchange, 400, Map.of("error", e.getMessage()));
        } catch (Exception e) {
            sendJson(exchange, 500, Map.of("error", e.getMessage()));
        }
    }

    private Object route(String path, Map<String, String> params) throws SQLException {
        // GET /api/artists?name=&country=&genre=
        if (path.equals("/artists") || path.equals("/artists/")) {
            if (params.containsKey("name"))    return artistQ.searchByName(params.get("name"));
            if (params.containsKey("country")) return artistQ.searchByCountry(params.get("country"));
            if (params.containsKey("genre"))   return artistQ.searchByGenre(params.get("genre"));
            int limit = Integer.parseInt(params.getOrDefault("limit", "100"));
            return artistQ.getTopByListeners(limit);
        }

        // GET /api/artists/{id}/report
        if (path.matches("/artists/\\d+/report")) {
            int id = Integer.parseInt(path.split("/")[2]);
            List<List<Map<String, Object>>> report = artistQ.getArtistReport(id);
            Map<String, Object> result = new LinkedHashMap<>();
            String[] keys = {"profile", "albums", "awards", "chartPeaks"};
            for (int i = 0; i < report.size() && i < keys.length; i++) {
                result.put(keys[i], report.get(i));
            }
            return result;
        }

        // GET /api/artists/{id}/charts
        if (path.matches("/artists/\\d+/charts")) {
            int id = Integer.parseInt(path.split("/")[2]);
            return chartQ.getChartPeaksForArtist(id);
        }

        // GET /api/artists/grammy-winners
        if (path.equals("/artists/grammy-winners")) {
            return artistQ.getGrammyWinners();
        }

        // GET /api/artists/emerging?debut=2018&listeners=5000000&maxWins=1
        if (path.equals("/artists/emerging")) {
            int debut = Integer.parseInt(params.getOrDefault("debut", "2018"));
            long listeners = Long.parseLong(params.getOrDefault("listeners", "5000000"));
            int maxWins = Integer.parseInt(params.getOrDefault("maxWins", "1"));
            return artistQ.getEmergingArtists(debut, listeners, maxWins);
        }

        // GET /api/tracks?title=&album=
        if (path.equals("/tracks") || path.equals("/tracks/")) {
            if (params.containsKey("title")) return trackQ.searchTracks(params.get("title"));
            if (params.containsKey("album")) return trackQ.getTracksByAlbum(params.get("album"));
            return trackQ.getTopStreamedTracks(20);
        }

        // GET /api/tracks/number-ones
        if (path.equals("/tracks/number-ones")) return trackQ.getNumberOneHits();

        // GET /api/tracks/multi-country
        if (path.equals("/tracks/multi-country")) return trackQ.getTracksChartedMultiCountry();

        // GET /api/charts?country=USA
        if (path.equals("/charts") || path.equals("/charts/")) {
            String country = params.getOrDefault("country", "USA");
            return chartQ.getChartsByCountry(country);
        }

        // GET /api/charts/genres?country=USA
        if (path.equals("/charts/genres")) {
            String country = params.getOrDefault("country", "USA");
            return chartQ.getGenreDominanceByCountry(country);
        }

        // GET /api/playlists?username=fan_casey
        if (path.equals("/playlists") || path.equals("/playlists/")) {
            String username = params.get("username");
            if (username == null) throw new IllegalArgumentException("username param required");
            return playlistQ.getPlaylistsForUser(username);
        }

        // GET /api/playlists/{id}/tracks
        if (path.matches("/playlists/\\d+/tracks")) {
            int id = Integer.parseInt(path.split("/")[2]);
            return playlistQ.getTracksInPlaylist(id);
        }

        throw new IllegalArgumentException("Unknown endpoint: " + path);
    }

    private void sendJson(HttpExchange exchange, int status, Object body) throws IOException {
        byte[] bytes = GSON.toJson(body).getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private Map<String, String> parseQuery(String rawQuery) {
        Map<String, String> params = new HashMap<>();
        if (rawQuery == null || rawQuery.isBlank()) return params;
        for (String pair : rawQuery.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                try {
                    params.put(
                        java.net.URLDecoder.decode(kv[0], StandardCharsets.UTF_8),
                        java.net.URLDecoder.decode(kv[1], StandardCharsets.UTF_8)
                    );
                } catch (Exception ignored) {}
            }
        }
        return params;
    }
}
