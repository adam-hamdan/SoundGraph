package soundgraph;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBConnection {
    private static Connection instance;

    private DBConnection() {}

    public static Connection get() throws SQLException {
        if (instance == null || instance.isClosed()) {
            Properties props = loadConfig();
            try {
                Class.forName(props.getProperty("db.driver"));
            } catch (ClassNotFoundException e) {
                throw new SQLException("MySQL driver not found", e);
            }
            instance = DriverManager.getConnection(
                props.getProperty("db.url"),
                props.getProperty("db.user"),
                props.getProperty("db.password")
            );
        }
        return instance;
    }

    public static Properties loadConfig() {
        Properties props = new Properties();
        try (InputStream in = DBConnection.class.getClassLoader()
                .getResourceAsStream("config.properties")) {
            if (in != null) {
                props.load(in);
            }
        } catch (IOException e) {
            // fall back to defaults
        }
        // Also try from working directory
        if (!props.containsKey("db.url")) {
            try (InputStream in = new java.io.FileInputStream("config.properties")) {
                props.load(in);
            } catch (IOException ignored) {}
        }
        props.putIfAbsent("db.url", "jdbc:mysql://localhost:3306/soundgraph?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        props.putIfAbsent("db.user", "root");
        props.putIfAbsent("db.password", "");
        props.putIfAbsent("db.driver", "com.mysql.cj.jdbc.Driver");
        props.putIfAbsent("web.port", "8080");
        return props;
    }

    public static void close() {
        if (instance != null) {
            try { instance.close(); } catch (SQLException ignored) {}
            instance = null;
        }
    }
}
