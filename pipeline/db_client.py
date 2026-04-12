from sqlalchemy import create_engine, text
import os

engine = create_engine(os.getenv("MYSQL_URL", "mysql+pymysql://root:root@localhost:3306/nexus"))

def insert_document(title, file_type, source_path) -> int:
    with engine.begin() as conn:
        result = conn.execute(text(
            "INSERT INTO documents (title, file_type, source_path) "
            "VALUES (:title, :file_type, :source_path)"
        ), {"title": title, "file_type": file_type, "source_path": source_path})
        return result.lastrowid

def insert_chunks(chunks: list[dict]):
    if not chunks:
        return
    with engine.begin() as conn:
        for chunk in chunks:
            conn.execute(text(
                "INSERT INTO chunks (doc_id, chunk_index, text, token_start, token_end) "
                "VALUES (:doc_id, :chunk_index, :text, :token_start, :token_end)"
            ), chunk)

def insert_entities(entities: list[dict]):
    with engine.begin() as conn:
        conn.execute(text(
            "INSERT INTO entities (chunk_id, name, type, description) "
            "VALUES (:chunk_id, :name, :type, :description)"
        ), entities)

def insert_relationships(relationships: list[dict]):
    with engine.begin() as conn:
        conn.execute(text(
            "INSERT INTO relationships (source, target, relation, chunk_id) "
            "VALUES (:source, :target, :relation, :chunk_id)"
        ), relationships)

        # updated