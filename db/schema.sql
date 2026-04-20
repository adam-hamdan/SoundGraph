-- SoundGraph Database Schema
-- CSDS 341 Spring 2026

CREATE DATABASE IF NOT EXISTS soundgraph CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soundgraph;

CREATE TABLE Artist (
    artist_id       INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(255) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    debut_year      YEAR NOT NULL,
    monthly_listeners BIGINT NOT NULL DEFAULT 0,
    CHECK (monthly_listeners >= 0),
    CHECK (debut_year >= 1900)
);

CREATE TABLE Album (
    album_id        INT PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    artist_id       INT NOT NULL,
    release_date    DATE NOT NULL,
    total_tracks    INT NOT NULL,
    label           VARCHAR(255),
    CHECK (total_tracks > 0),
    FOREIGN KEY (artist_id) REFERENCES Artist(artist_id) ON DELETE CASCADE
);

CREATE TABLE Track (
    track_id        INT PRIMARY KEY AUTO_INCREMENT,
    title           VARCHAR(255) NOT NULL,
    album_id        INT NOT NULL,
    duration_sec    INT NOT NULL,
    explicit        BOOLEAN NOT NULL DEFAULT FALSE,
    stream_count    BIGINT NOT NULL DEFAULT 0,
    CHECK (duration_sec > 0),
    CHECK (stream_count >= 0),
    FOREIGN KEY (album_id) REFERENCES Album(album_id) ON DELETE CASCADE
);

CREATE TABLE Collaboration (
    collab_id       INT PRIMARY KEY AUTO_INCREMENT,
    artist_id_1     INT NOT NULL,
    artist_id_2     INT NOT NULL,
    track_id        INT NOT NULL,
    collab_date     DATE NOT NULL,
    CHECK (artist_id_1 <> artist_id_2),
    UNIQUE KEY uq_collab (artist_id_1, artist_id_2, track_id),
    FOREIGN KEY (artist_id_1) REFERENCES Artist(artist_id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id_2) REFERENCES Artist(artist_id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES Track(track_id) ON DELETE CASCADE
);

CREATE TABLE Genre (
    genre_id        INT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL UNIQUE,
    parent_genre_id INT,
    FOREIGN KEY (parent_genre_id) REFERENCES Genre(genre_id) ON DELETE SET NULL
);

CREATE TABLE ArtistGenre (
    artist_id       INT NOT NULL,
    genre_id        INT NOT NULL,
    PRIMARY KEY (artist_id, genre_id),
    FOREIGN KEY (artist_id) REFERENCES Artist(artist_id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES Genre(genre_id) ON DELETE CASCADE
);

CREATE TABLE AwardHistory (
    award_id        INT PRIMARY KEY AUTO_INCREMENT,
    artist_id       INT,
    track_id        INT,
    award_show      VARCHAR(100) NOT NULL,
    category        VARCHAR(255) NOT NULL,
    year            YEAR NOT NULL,
    outcome         VARCHAR(20) NOT NULL,
    CHECK (outcome IN ('Won', 'Nominated')),
    FOREIGN KEY (artist_id) REFERENCES Artist(artist_id) ON DELETE SET NULL,
    FOREIGN KEY (track_id) REFERENCES Track(track_id) ON DELETE SET NULL
);

CREATE TABLE ChartHistory (
    chart_id        INT PRIMARY KEY AUTO_INCREMENT,
    track_id        INT NOT NULL,
    chart_date      DATE NOT NULL,
    country         VARCHAR(100) NOT NULL,
    position        INT NOT NULL,
    chart_name      VARCHAR(100) NOT NULL,
    CHECK (position BETWEEN 1 AND 100),
    UNIQUE KEY uq_chart_entry (track_id, chart_date, country, chart_name),
    FOREIGN KEY (track_id) REFERENCES Track(track_id) ON DELETE CASCADE
);

CREATE TABLE User (
    user_id         INT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE UserPlaylist (
    playlist_id     INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    name            VARCHAR(255) NOT NULL,
    created_date    DATE NOT NULL,
    track_count     INT NOT NULL DEFAULT 0,
    CHECK (track_count >= 0),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

CREATE TABLE PlaylistTrack (
    playlist_id     INT NOT NULL,
    track_id        INT NOT NULL,
    added_date      DATE NOT NULL,
    PRIMARY KEY (playlist_id, track_id),
    FOREIGN KEY (playlist_id) REFERENCES UserPlaylist(playlist_id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES Track(track_id) ON DELETE CASCADE
);

-- Indexes for common query patterns
CREATE INDEX idx_album_artist ON Album(artist_id);
CREATE INDEX idx_track_album ON Track(album_id);
CREATE INDEX idx_chart_track ON ChartHistory(track_id);
CREATE INDEX idx_chart_country ON ChartHistory(country);
CREATE INDEX idx_award_artist ON AwardHistory(artist_id);
CREATE INDEX idx_collab_artist1 ON Collaboration(artist_id_1);
CREATE INDEX idx_collab_artist2 ON Collaboration(artist_id_2);
