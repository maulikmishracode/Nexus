import requests
import os
from db_client import engine
from sqlalchemy import text

OLLAMA_URL = "http://localhost:11434/api/generate"

def hf_generate(prompt: str) -> str:
    try:
        response = requests.post(OLLAMA_URL, json={
            "model":  "tinyllama",
            "prompt": prompt,
            "stream": False
        })
        return response.json().get("response", "")
    except Exception as e:
        return f"Error: {e}"

def get_all_chunks() -> list:
    with engine.connect() as conn:
        rows = conn.execute(text(
            "SELECT c.id, c.text, c.doc_id, d.title "
            "FROM chunks c JOIN documents d ON c.doc_id = d.id "
            "LIMIT 50"
        )).fetchall()
    return [dict(r._mapping) for r in rows]

def multi_hop_answer(question: str) -> dict:
    chunks = get_all_chunks()
    if not chunks:
        return {
            "answer": "No documents ingested yet.",
            "sources": "", "confidence": "0.0",
            "reasoning_path": "", "chunks": []
        }

    context = "\n\n".join([
        f"[Source: {c['title']}]\n{c['text'][:400]}"
        for c in chunks
    ])

    prompt = f"""<s>[INST] You are NEXUS, an enterprise knowledge graph AI.
Answer this question using the documents below.
Reply in this EXACT format:
ANSWER: your answer here
SOURCES: document titles used
CONFIDENCE: 0.85
REASONING_PATH: doc1 → doc2

Documents:
{context}

Question: {question} [/INST]"""

    raw = hf_generate(prompt)

    # HF returns full prompt + response, extract just the response
    if "[/INST]" in raw:
        raw = raw.split("[/INST]")[-1].strip()

    result = {
        "answer":         "",
        "sources":        "",
        "confidence":     "0.85",
        "reasoning_path": "",
        "chunks":         chunks[:3]
    }

    for line in raw.split("\n"):
        line = line.strip()
        if line.startswith("ANSWER:"):
            result["answer"] = line.replace("ANSWER:", "").strip()
        elif line.startswith("SOURCES:"):
            result["sources"] = line.replace("SOURCES:", "").strip()
        elif line.startswith("CONFIDENCE:"):
            result["confidence"] = line.replace("CONFIDENCE:", "").strip()
        elif line.startswith("REASONING_PATH:"):
            result["reasoning_path"] = line.replace("REASONING_PATH:", "").strip()

    # Fallback if model didn't follow format
    if not result["answer"]:
        result["answer"] = raw[:500].strip()
        result["sources"] = ", ".join(set(c['title'] for c in chunks[:3]))
        result["reasoning_path"] = " → ".join(set(c['title'] for c in chunks[:3]))

    return result
