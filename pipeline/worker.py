import redis
import json
import sys
import os
from ingest import ingest_file
from extract import extract_and_store
from db_client import engine
from sqlalchemy import text

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def process_job(filepath: str):
    doc_id = ingest_file(filepath)
    with engine.connect() as conn:
        chunks = conn.execute(text(
            "SELECT id, text FROM chunks WHERE doc_id = :doc_id"
        ), {"doc_id": doc_id}).fetchall()
    for chunk in chunks:
        extract_and_store(chunk.id, chunk.text)
        print(f"  → extracted from chunk {chunk.id}")

def run_queue_mode():
    print("Worker listening on 'ingest_queue'...")
    while True:
        _, message = r.brpop("ingest_queue")
        job = json.loads(message)
        try:
            process_job(job["filepath"])
        except Exception as e:
            print(f"✗ Failed: {e}")

def run_cli_mode(source_dir: str):
    for fname in os.listdir(source_dir):
        if fname.endswith((".pdf", ".html")):
            filepath = os.path.join(source_dir, fname)
            with engine.connect() as conn:
                exists = conn.execute(text(
                    "SELECT id FROM documents WHERE source_path = :path"
                ), {"path": filepath}).fetchone()
            if exists:
                print(f"⏭ Skipping {fname} — already ingested")
                continue
            process_job(filepath)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_cli_mode(sys.argv[1])
    else:
        run_queue_mode()

        # updated