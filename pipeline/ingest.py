import fitz
from bs4 import BeautifulSoup
from transformers import AutoTokenizer
from db_client import insert_document, insert_chunks

tokenizer  = AutoTokenizer.from_pretrained("bert-base-uncased")
CHUNK_SIZE = 512
OVERLAP    = 50

def parse_pdf(filepath: str) -> dict:
    doc   = fitz.open(filepath)
    text  = "\n".join(page.get_text() for page in doc)
    title = doc.metadata.get("title") or filepath.split("/")[-1]
    return {"title": title, "text": text, "type": "pdf"}

def parse_html(filepath: str) -> dict:
    with open(filepath, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    for tag in soup(["nav", "footer", "script", "style"]):
        tag.decompose()
    title = str(soup.title.string) if soup.title else filepath
    return {"title": title, "text": soup.get_text(separator="\n", strip=True), "type": "html"}

def chunk_text(doc_id: int, text: str) -> list[dict]:
    tokens = tokenizer.encode(text, add_special_tokens=False)
    chunks, start, idx = [], 0, 0
    while start < len(tokens):
        end = start + CHUNK_SIZE
        chunks.append({
            "doc_id":      doc_id,
            "chunk_index": idx,
            "text":        tokenizer.decode(tokens[start:end]),
            "token_start": start,
            "token_end":   min(end, len(tokens)),
        })
        start += CHUNK_SIZE - OVERLAP
        idx   += 1
    return chunks

def ingest_file(filepath: str) -> int:
    ext    = filepath.rsplit(".", 1)[-1].lower()
    parsed = parse_pdf(filepath) if ext == "pdf" else parse_html(filepath)
    doc_id = insert_document(parsed["title"], ext, filepath)
    chunks = chunk_text(doc_id, parsed["text"])
    insert_chunks(chunks)
    print(f"✓ {filepath} → {len(chunks)} chunks (doc_id={doc_id})")
    return doc_id

# updated
