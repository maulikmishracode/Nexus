CREATE DATABASE IF NOT EXISTS nexus;
USE nexus;

CREATE TABLE IF NOT EXISTS documents (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(512),
    file_type   VARCHAR(32),
    source_path TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chunks (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doc_id      INT NOT NULL,
    chunk_index INT NOT NULL,
    text        LONGTEXT,
    token_start INT,
    token_end   INT,
    FOREIGN KEY (doc_id) REFERENCES documents(id)
);

CREATE FULLTEXT INDEX ft_chunks_text ON chunks(text);

CREATE TABLE IF NOT EXISTS entities (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    chunk_id    INT,
    name        VARCHAR(512),
    type        VARCHAR(128),
    description TEXT,
    FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

CREATE TABLE IF NOT EXISTS relationships (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    source      VARCHAR(512),
    target      VARCHAR(512),
    relation    TEXT,
    chunk_id    INT,
    FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

-- Stores emails from "Get Early Access" button
CREATE TABLE IF NOT EXISTS waitlist (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores messages from "Send Message" button
CREATE TABLE IF NOT EXISTS contacts (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255),
    email      VARCHAR(255),
    message    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

#updated