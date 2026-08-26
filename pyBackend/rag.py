import os
import chromadb
from chromadb.utils import embedding_functions

chroma_client = chromadb.PersistentClient(path="./chroma_db")

embedding_fn = embedding_functions.DefaultEmbeddingFunction()

collection = chroma_client.get_or_create_collection(
    name="ayurvedic_knowledge",
    embedding_function=embedding_fn
)

def initialize_knowledge_base():
    """Loads the reference file into ChromaDB if the collection is empty."""
    if collection.count() == 0:
        kb_path = os.path.join(os.path.dirname(__file__), "kb", "ayurveda_ref.txt")
        if os.path.exists(kb_path):
            with open(kb_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            chunks = [chunk.strip() for chunk in content.split("\n\n") if chunk.strip()]
            
            if chunks:
                ids = [f"doc_{i}" for i in range(len(chunks))]
                collection.add(
                    documents=chunks,
                    ids=ids
                )
                print(f"Loaded {len(chunks)} Ayurvedic reference chunks into Vector DB.")

def retrieve_relevant_context(query: str, n_results: int = 2) -> str:
    """Searches the Vector DB for context matching the patient's symptoms."""
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        matches = results.get("documents", [[]])[0]
        return "\n".join(matches) if matches else "No specific Ayurvedic reference found."
    except Exception as e:
        print(f"Vector DB Search Error: {e}")
        return "Error retrieving context."