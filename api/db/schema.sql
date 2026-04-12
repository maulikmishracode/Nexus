CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT,         -- raw text or metadata
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nodes (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  group TEXT,
  document_id INTEGER REFERENCES documents(id)
);

CREATE TABLE edges (
  id SERIAL PRIMARY KEY,
  from_id INTEGER NOT NULL REFERENCES nodes(id),
  to_id INTEGER NOT NULL REFERENCES nodes(id),
  label TEXT
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);
