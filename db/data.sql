-- SoundGraph Seed Data
USE soundgraph;

-- Genres (hierarchy: root genres first, then subgenres)
INSERT INTO Genre (genre_id, name, parent_genre_id) VALUES
(1,  'Pop',             NULL),
(2,  'Rock',            NULL),
(3,  'Hip-Hop',         NULL),
(4,  'R&B',             NULL),
(5,  'Electronic',      NULL),
(6,  'Country',         NULL),
(7,  'Latin',           NULL),
(8,  'K-Pop',           1),
(9,  'Indie Pop',       1),
(10, 'Alternative Rock',2),
(11, 'Rap',             3),
(12, 'Trap',            3),
(13, 'Soul',            4),
(14, 'Dance Pop',       1),
(15, 'Reggaeton',       7);

-- Artists
INSERT INTO Artist (artist_id, name, country, debut_year, monthly_listeners) VALUES
(1,  'Taylor Swift',       'USA',         2006, 82000000),
(2,  'Drake',              'Canada',      2006, 75000000),
(3,  'Billie Eilish',      'USA',         2015, 65000000),
(4,  'Bad Bunny',          'Puerto Rico', 2016, 70000000),
(5,  'The Weeknd',         'Canada',      2010, 78000000),
(6,  'Olivia Rodrigo',     'USA',         2020, 55000000),
(7,  'BTS',                'South Korea', 2013, 60000000),
(8,  'Dua Lipa',           'UK',          2015, 58000000),
(9,  'Kendrick Lamar',     'USA',         2003, 45000000),
(10, 'Ariana Grande',      'USA',         2008, 72000000),
(11, 'Post Malone',        'USA',         2015, 50000000),
(12, 'SZA',                'USA',         2012, 42000000),
(13, 'Harry Styles',       'UK',          2010, 52000000),
(14, 'Doja Cat',           'USA',         2012, 48000000),
(15, 'J. Cole',            'USA',         2007, 35000000),
(16, 'Sabrina Carpenter',  'USA',         2014, 40000000),
(17, 'Peso Pluma',         'Mexico',      2020, 38000000),
(18, 'Mitski',             'USA',         2012, 18000000),
(19, 'Lana Del Rey',       'USA',         2010, 32000000),
(20, 'NewJeans',           'South Korea', 2022, 22000000);

-- ArtistGenre mappings
INSERT INTO ArtistGenre (artist_id, genre_id) VALUES
(1,  1), (1,  6),
(2,  3), (2,  11),
(3,  1), (3,  5),
(4,  7), (4,  15),
(5,  4), (5,  14),
(6,  1), (6,  9),
(7,  8),
(8,  1), (8,  14),
(9,  3), (9,  11),
(10, 1), (10, 4),
(11, 3), (11, 1),
(12, 4), (12, 13),
(13, 1), (13, 2),
(14, 3), (14, 1),
(15, 3), (15, 11),
(16, 1), (16, 9),
(17, 7), (17, 15),
(18, 9), (18, 10),
(19, 1), (19, 9),
(20, 8), (20, 1);

-- Albums
INSERT INTO Album (album_id, title, artist_id, release_date, total_tracks, label) VALUES
(1,  'Midnights',                1,  '2022-10-21', 13, 'Republic'),
(2,  'The Tortured Poets Department', 1, '2024-04-19', 31, 'Republic'),
(3,  'Certified Lover Boy',      2,  '2021-09-03', 21, 'OVO/Republic'),
(4,  'Honestly, Nevermind',      2,  '2022-06-17', 14, 'OVO/Republic'),
(5,  'Happier Than Ever',        3,  '2021-07-30', 16, 'Interscope'),
(6,  'Hit Me Hard and Soft',     3,  '2024-05-17', 10, 'Interscope'),
(7,  'Un Verano Sin Ti',         4,  '2022-05-06', 23, 'Rimas'),
(8,  'nadie sabe lo que va a pasar mañana', 4, '2023-10-13', 22, 'Rimas'),
(9,  'Dawn FM',                  5,  '2022-01-07', 16, 'XO/Republic'),
(10, 'After Hours',              5,  '2020-03-20', 14, 'XO/Republic'),
(11, 'SOUR',                     6,  '2021-05-21', 11, 'Geffen'),
(12, 'GUTS',                     6,  '2023-09-08', 12, 'Geffen'),
(13, 'Proof',                    7,  '2022-06-10', 48, 'HYBE/Columbia'),
(14, 'Future Nostalgia',         8,  '2020-03-27', 11, 'Warner'),
(15, 'Mr. Morale & The Big Steppers', 9, '2022-05-13', 18, 'pgLang/Interscope'),
(16, 'GNX',                      9,  '2024-11-22', 12, 'pgLang/Interscope'),
(17, 'eternal sunshine',         10, '2024-03-08', 13, 'Republic'),
(18, 'Austin',                   11, '2023-07-28', 17, 'Republic'),
(19, 'SOS',                      12, '2022-12-09', 23, 'RCA/Top Dawg'),
(20, 'Harry\'s House',           13, '2022-05-20', 13, 'Columbia'),
(21, 'Scarlet',                  14, '2023-09-22', 18, 'Kemosabe/RCA'),
(22, 'Short n\' Sweet',          16, '2024-08-23', 12, 'Island'),
(23, 'GÉNESIS',                  17, '2023-11-10', 22, 'DEL Records'),
(24, 'The Land Is Inhospitable', 18, '2023-09-15', 11, 'Dead Oceans'),
(25, 'Did You Know That There\'s a Tunnel Under Ocean Blvd', 19, '2023-03-24', 16, 'Interscope'),
(26, 'OT27',                     20, '2024-08-28', 14, 'ADOR/HYBE');

-- Tracks
INSERT INTO Track (track_id, title, album_id, duration_sec, explicit, stream_count) VALUES
-- Taylor Swift - Midnights
(1,  'Anti-Hero',                 1,  200, FALSE, 2800000000),
(2,  'Lavender Haze',             1,  202, FALSE, 1400000000),
(3,  'Midnight Rain',             1,  174, FALSE,  900000000),
-- Taylor Swift - TTPD
(4,  'Fortnight',                 2,  228, FALSE, 1600000000),
(5,  'Down Bad',                  2,  272, FALSE,  800000000),
-- Drake - CLB
(6,  'Way 2 Sexy',                3,  249, TRUE,  1200000000),
(7,  'Champagne Poetry',          3,  340, TRUE,   700000000),
-- Drake - Honestly, Nevermind
(8,  'Texts Go Green',            4,  218, FALSE,  600000000),
-- Billie Eilish - Happier Than Ever
(9,  'Happier Than Ever',         5,  295, FALSE, 1500000000),
(10, 'Therefore I Am',            5,  174, FALSE,  900000000),
-- Billie Eilish - Hit Me Hard and Soft
(11, 'BIRDS OF A FEATHER',        6,  210, FALSE, 1100000000),
(12, 'LUNCH',                     6,  175, FALSE,  600000000),
-- Bad Bunny - Un Verano Sin Ti
(13, 'Me Porto Bonito',           7,  178, FALSE, 2100000000),
(14, 'Tití Me Preguntó',          7,  238, FALSE, 1900000000),
(15, 'Efecto',                    7,  196, FALSE,  900000000),
-- Bad Bunny - nadie sabe
(16, 'Monaco',                    8,  221, FALSE, 1000000000),
-- The Weeknd - Dawn FM
(17, 'Take My Breath',            9,  221, FALSE, 1100000000),
(18, 'Sacrifice',                 9,  190, FALSE,  800000000),
-- The Weeknd - After Hours
(19, 'Blinding Lights',          10,  200, FALSE, 4200000000),
(20, 'Save Your Tears',          10,  215, FALSE, 2200000000),
-- Olivia Rodrigo - SOUR
(21, 'drivers license',          11,  242, FALSE, 2000000000),
(22, 'good 4 u',                 11,  178, FALSE, 1700000000),
-- Olivia Rodrigo - GUTS
(23, 'vampire',                  12,  219, FALSE, 1400000000),
(24, 'bad idea right?',          12,  176, FALSE,  700000000),
-- BTS - Proof
(25, 'Yet To Come',              13,  230, FALSE,  800000000),
-- Dua Lipa - Future Nostalgia
(26, 'Levitating',               14,  203, FALSE, 2800000000),
(27, 'Don\'t Start Now',         14,  183, FALSE, 2400000000),
-- Kendrick Lamar - Mr. Morale
(28, 'N95',                      15,  213, TRUE,   700000000),
(29, 'The Heart Part 5',         15,  336, TRUE,   500000000),
-- Kendrick Lamar - GNX
(30, 'squabble up',              16,  154, TRUE,   900000000),
(31, 'luther',                   16,  237, FALSE,  850000000),
-- Ariana Grande - eternal sunshine
(32, 'we can\'t be friends',     17,  218, FALSE,  900000000),
(33, 'eternal sunshine',         17,  179, FALSE,  700000000),
-- Post Malone - Austin
(34, 'Chemical',                 18,  190, FALSE,  700000000),
-- SZA - SOS
(35, 'Kill Bill',                19,  154, TRUE,  1200000000),
(36, 'Snooze',                   19,  218, FALSE,  900000000),
-- Harry Styles - Harry's House
(37, 'As It Was',                20,  167, FALSE, 3500000000),
(38, 'Late Night Talking',       20,  174, FALSE,  800000000),
-- Doja Cat - Scarlet
(39, 'Paint The Town Red',       21,  213, TRUE,   900000000),
-- Sabrina Carpenter - Short n' Sweet
(40, 'Espresso',                 22,  176, FALSE, 1800000000),
(41, 'Please Please Please',     22,  187, FALSE, 1200000000),
-- Peso Pluma - GÉNESIS
(42, 'BZRP Music Sessions #55',  23,  197, TRUE,  1500000000),
-- Mitski
(43, 'My Love Mine All Mine',    24,  176, FALSE,  400000000),
-- Lana Del Rey
(44, 'A&W',                      25,  437, FALSE,  600000000),
-- NewJeans
(45, 'Super Shy',                26,  163, FALSE,  500000000),
(46, 'ETA',                      26,  192, FALSE,  380000000);

-- Collaborations
INSERT INTO Collaboration (collab_id, artist_id_1, artist_id_2, track_id, collab_date) VALUES
(1,  1,  11, 4,  '2024-04-05'),  -- Taylor Swift & Post Malone - Fortnight
(2,  4,  12, 13, '2022-05-06'),  -- Bad Bunny & SZA - Me Porto Bonito (feat.)
(3,  2,  5,  6,  '2021-09-03'),  -- Drake & The Weeknd - Way 2 Sexy
(4,  8,  2,  26, '2020-03-27'),  -- Dua Lipa & Drake - Levitating remix
(5,  9,  12, 28, '2022-05-13'),  -- Kendrick & SZA - N95 area
(6,  10, 1,  32, '2024-03-08'),  -- Ariana & Taylor (fan fave pairing)
(7,  6,  13, 23, '2023-09-08'),  -- Olivia Rodrigo & Harry Styles
(8,  14, 9,  39, '2023-09-22'),  -- Doja Cat & Kendrick
(9,  16, 2,  40, '2024-08-23'),  -- Sabrina Carpenter & Drake
(10, 5,  10, 17, '2022-01-07'),  -- The Weeknd & Ariana Grande
(11, 4,  17, 42, '2023-11-10'),  -- Bad Bunny & Peso Pluma
(12, 9,  15, 30, '2024-11-22'),  -- Kendrick & J. Cole
(13, 7,  20, 25, '2022-06-10'),  -- BTS & NewJeans
(14, 3,  8,  11, '2024-05-17'),  -- Billie Eilish & Dua Lipa
(15, 1,  19, 3,  '2022-10-21');  -- Taylor Swift & Lana Del Rey

-- Award History
INSERT INTO AwardHistory (award_id, artist_id, track_id, award_show, category, year, outcome) VALUES
(1,  1,  1,  'Grammy Awards',       'Record of the Year',           2024, 'Won'),
(2,  1,  NULL,'Grammy Awards',      'Artist of the Year',           2024, 'Won'),
(3,  1,  21, 'Billboard Music Awards','Top Hot 100 Song',           2023, 'Nominated'),
(4,  3,  9,  'Grammy Awards',       'Song of the Year',             2022, 'Won'),
(5,  3,  NULL,'Grammy Awards',      'Best New Artist',              2020, 'Won'),
(6,  5,  19, 'Grammy Awards',       'Best Pop Solo Performance',    2021, 'Nominated'),
(7,  5,  19, 'Billboard Music Awards','Top Hot 100 Song',           2021, 'Won'),
(8,  6,  21, 'Grammy Awards',       'Best New Artist',              2022, 'Nominated'),
(9,  6,  22, 'MTV VMAs',            'Video of the Year',            2021, 'Won'),
(10, 8,  26, 'Grammy Awards',       'Best Dance Recording',         2021, 'Won'),
(11, 8,  27, 'Billboard Music Awards','Top Dance/Electronic Song',  2021, 'Won'),
(12, 9,  NULL,'Grammy Awards',      'Best Rap Album',               2023, 'Won'),
(13, 9,  29, 'Grammy Awards',       'Best Melodic Rap Performance', 2023, 'Won'),
(14, 2,  NULL,'Grammy Awards',      'Best Rap Album',               2022, 'Nominated'),
(15, 12, 35, 'Grammy Awards',       'Best R&B Performance',         2024, 'Nominated'),
(16, 12, NULL,'Grammy Awards',      'Best R&B Album',               2023, 'Won'),
(17, 13, 37, 'Grammy Awards',       'Song of the Year',             2023, 'Nominated'),
(18, 13, 37, 'Billboard Music Awards','Top Hot 100 Song',           2022, 'Won'),
(19, 4,  NULL,'Grammy Awards',      'Best Música Urbana Album',     2023, 'Won'),
(20, 4,  13, 'Latin Grammy Awards', 'Record of the Year',           2023, 'Won'),
(21, 7,  NULL,'Grammy Awards',      'Best Pop Duo/Group Performance',2022,'Nominated'),
(22, 16, 40, 'Grammy Awards',       'Song of the Year',             2025, 'Nominated'),
(23, 16, 40, 'MTV VMAs',            'Song of Summer',               2024, 'Won'),
(24, 9,  NULL,'Grammy Awards',      'Album of the Year',            2025, 'Won'),
(25, 1,  NULL,'Time Magazine',      'Person of the Year',           2023, 'Won');

-- Chart History
INSERT INTO ChartHistory (chart_id, track_id, chart_date, country, position, chart_name) VALUES
-- Anti-Hero
(1,  1, '2022-10-29', 'USA',   1, 'Billboard Hot 100'),
(2,  1, '2022-11-05', 'USA',   1, 'Billboard Hot 100'),
(3,  1, '2022-11-12', 'USA',   1, 'Billboard Hot 100'),
(4,  1, '2022-10-29', 'UK',    1, 'UK Singles Chart'),
(5,  1, '2022-10-29', 'Australia', 1, 'ARIA Chart'),
-- Blinding Lights
(6,  19, '2020-03-28', 'USA',  1, 'Billboard Hot 100'),
(7,  19, '2020-04-04', 'USA',  1, 'Billboard Hot 100'),
(8,  19, '2020-04-04', 'UK',   1, 'UK Singles Chart'),
(9,  19, '2020-04-04', 'Germany', 1, 'GfK Entertainment'),
(10, 19, '2020-04-04', 'Australia', 1, 'ARIA Chart'),
-- drivers license
(11, 21, '2021-01-16', 'USA',  1, 'Billboard Hot 100'),
(12, 21, '2021-01-23', 'USA',  1, 'Billboard Hot 100'),
(13, 21, '2021-01-16', 'UK',   1, 'UK Singles Chart'),
(14, 21, '2021-01-16', 'Australia', 2, 'ARIA Chart'),
-- As It Was
(15, 37, '2022-04-09', 'USA',  1, 'Billboard Hot 100'),
(16, 37, '2022-04-16', 'USA',  1, 'Billboard Hot 100'),
(17, 37, '2022-04-09', 'UK',   1, 'UK Singles Chart'),
(18, 37, '2022-04-09', 'Germany', 1, 'GfK Entertainment'),
-- Me Porto Bonito
(19, 13, '2022-06-04', 'USA',  4, 'Billboard Hot 100'),
(20, 13, '2022-06-04', 'Spain',1, 'España Canciones'),
(21, 13, '2022-06-11', 'Mexico',1,'Mexico Singles'),
-- Espresso
(22, 40, '2024-04-20', 'USA',  4, 'Billboard Hot 100'),
(23, 40, '2024-04-27', 'USA',  3, 'Billboard Hot 100'),
(24, 40, '2024-04-20', 'UK',   2, 'UK Singles Chart'),
(25, 40, '2024-04-20', 'Australia', 1, 'ARIA Chart'),
-- Levitating
(26, 26, '2021-01-09', 'USA',  2, 'Billboard Hot 100'),
(27, 26, '2021-01-16', 'USA',  1, 'Billboard Hot 100'),
(28, 26, '2021-01-09', 'UK',   3, 'UK Singles Chart'),
-- Kill Bill
(29, 35, '2022-12-17', 'USA', 12, 'Billboard Hot 100'),
(30, 35, '2023-01-07', 'USA',  9, 'Billboard Hot 100'),
-- Fortnight
(31, 4,  '2024-04-20', 'USA',  1, 'Billboard Hot 100'),
(32, 4,  '2024-04-27', 'USA',  1, 'Billboard Hot 100'),
(33, 4,  '2024-04-20', 'UK',   1, 'UK Singles Chart'),
-- vampire
(34, 23, '2023-06-24', 'USA',  1, 'Billboard Hot 100'),
(35, 23, '2023-07-01', 'USA',  1, 'Billboard Hot 100'),
-- Super Shy
(36, 45, '2023-07-22', 'South Korea', 1, 'Gaon Chart'),
(37, 45, '2023-07-29', 'South Korea', 1, 'Gaon Chart'),
-- squabble up
(38, 30, '2024-11-30', 'USA',  2, 'Billboard Hot 100'),
-- luther
(39, 31, '2024-11-30', 'USA',  5, 'Billboard Hot 100'),
-- Paint The Town Red
(40, 39, '2023-09-30', 'USA',  1, 'Billboard Hot 100');

-- Users
INSERT INTO User (user_id, username) VALUES
(1, 'journalist_alex'),
(2, 'ar_rep_morgan'),
(3, 'fan_casey'),
(4, 'music_critic'),
(5, 'playlist_queen');

-- UserPlaylists
INSERT INTO UserPlaylist (playlist_id, user_id, name, created_date, track_count) VALUES
(1, 1, 'Grammy Winners 2024',          '2024-02-05', 0),
(2, 2, 'Emerging Latin Artists',       '2024-01-15', 0),
(3, 3, 'Chill Pop Vibes',              '2023-06-01', 0),
(4, 4, 'Best of 2023',                 '2023-12-31', 0),
(5, 5, 'Workout Bangers',              '2024-03-01', 0),
(6, 3, 'Road Trip Mix',                '2024-07-04', 0),
(7, 1, 'Album of the Year Contenders', '2024-11-01', 0),
(8, 5, 'Late Night Study',             '2024-09-01', 0);

-- PlaylistTrack entries (triggers will update track_count)
INSERT INTO PlaylistTrack (playlist_id, track_id, added_date) VALUES
(1, 1,  '2024-02-05'), (1, 4,  '2024-02-05'), (1, 9,  '2024-02-06'),
(2, 13, '2024-01-16'), (2, 14, '2024-01-16'), (2, 42, '2024-01-17'),
(3, 11, '2023-06-02'), (3, 26, '2023-06-02'), (3, 40, '2024-05-01'),
(4, 1,  '2023-12-31'), (4, 37, '2023-12-31'), (4, 23, '2023-12-31'),
(4, 35, '2024-01-01'), (4, 28, '2024-01-01'),
(5, 22, '2024-03-01'), (5, 19, '2024-03-01'), (5, 27, '2024-03-01'),
(6, 19, '2024-07-04'), (6, 26, '2024-07-04'), (6, 13, '2024-07-05'),
(7, 30, '2024-11-25'), (7, 31, '2024-11-25'), (7, 4,  '2024-11-25'),
(8, 44, '2024-09-01'), (8, 43, '2024-09-01');

-- Sync track_count now that triggers aren't set up yet during initial load
UPDATE UserPlaylist p
SET track_count = (
    SELECT COUNT(*) FROM PlaylistTrack pt WHERE pt.playlist_id = p.playlist_id
);
