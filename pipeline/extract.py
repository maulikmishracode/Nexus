from transformers import pipeline
from db_client import insert_entities, insert_relationships

ner = pipeline("ner", model="dslim/bert-base-NER", aggregation_strategy="simple")

def extract_and_store(chunk_id: int, chunk_text: str):
    results = ner(chunk_text[:512])  # NER has token limit

    entities = [
        {
            "chunk_id":    chunk_id,
            "name":        r["word"],
            "type":        r["entity_group"],
            "description": f"Score: {r['score']:.2f}"
        }
        for r in results if r["score"] > 0.85
    ]

    # Simple relationship — connect entities that appear in same chunk
    relationships = []
    for i in range(len(entities)):
        for j in range(i + 1, len(entities)):
            relationships.append({
                "chunk_id": chunk_id,
                "source":   entities[i]["name"],
                "target":   entities[j]["name"],
                "relation": "co-occurs-with"
            })

    if entities:       insert_entities(entities)
    if relationships:  insert_relationships(relationships)
    return {"entities": entities, "relationships": relationships}

#updated