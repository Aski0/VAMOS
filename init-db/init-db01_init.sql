-- Upewnij się, że tabela jest tworzona, jeśli nie istnieje (DDL)
-- Spring Boot może już utworzyć tabelę dzięki 'spring.jpa.hibernate.ddl-auto=update'
-- ale lepiej mieć ten skrypt jako fallback i do wstawiania danych.

-- Upewnienie się, że tabela istnieje (dostosuj, jeśli Twoja nazwa to VaSource lub video_sources)
CREATE TABLE IF NOT EXISTS va_sources (
    id BIGSERIAL PRIMARY KEY,
    youtube_link VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    artist VARCHAR(255),
    is_video BOOLEAN NOT NULL
);

-- DANE AUDIO (Może być użyte TYLKO jako MUZYKA)
INSERT INTO va_sources (youtube_link, title, artist, is_video) VALUES
('X5P2uJELu5A', 'Don Pedalini', 'Franek Masturbatra', FALSE),
('qQzdAsjWGPg', 'My Way', 'Frank Sinatra', FALSE),
('CFlMy48ui9s', 'Fly me to the moon', 'Frank Sinatra', FALSE);

-- DANE WIDEO/AUDIO (Może być użyte jako MUZYKA lub KLIP WIDEO)
INSERT INTO va_sources (youtube_link, title, artist, is_video) VALUES
('ckbMWsBfO8o', 'SYRENKA', 'TUSZOL & WRONEK', TRUE),
('KQ6zr6kCPj8', 'Party Rock Anthem', 'LMFAO', TRUE),
('9bZkp7q19f0', 'Gangnam Style (Official Video)', 'PSY', TRUE),
('DyDfgMOUjCI', 'Bad Guy (Official Video)', 'Billie Eilish', TRUE);

-- Uwaga: Użyj ID YouTube (np. 'dQw4w9WgXcQ'), a nie pełnego URL