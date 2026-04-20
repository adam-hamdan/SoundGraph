package soundgraph;

import soundgraph.web.WebServer;

public class Main {
    public static void main(String[] args) throws Exception {
        boolean webMode = args.length > 0 && args[0].equals("--web");

        // Verify DB connection on startup
        try {
            DBConnection.get();
            System.out.println("Connected to database.");
        } catch (Exception e) {
            System.err.println("Failed to connect to database: " + e.getMessage());
            System.err.println("Check config.properties and ensure MySQL is running.");
            System.exit(1);
        }

        if (webMode) {
            WebServer.start();
        } else {
            new CLI().run();
            DBConnection.close();
        }
    }
}
