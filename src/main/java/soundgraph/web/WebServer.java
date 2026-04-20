package soundgraph.web;

import com.sun.net.httpserver.HttpServer;
import soundgraph.DBConnection;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Properties;
import java.util.concurrent.Executors;

public class WebServer {
    public static void start() throws IOException {
        Properties config = DBConnection.loadConfig();
        int port = Integer.parseInt(config.getProperty("web.port", "8080"));

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api", new ApiHandler());
        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();

        System.out.println("SoundGraph API server running at http://localhost:" + port);
        System.out.println("Frontend dev server: cd frontend && npm run dev");
        System.out.println("Press Ctrl+C to stop.");

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            server.stop(1);
            DBConnection.close();
        }));
    }
}
