from sentence_transformers import SentenceTransformer
import faiss
import os
import pickle

MODEL_NAME = "all-MiniLM-L6-v2"

def build_vector_store():
    model = SentenceTransformer(MODEL_NAME)

    with open("knowledge/medicines.txt", "r", encoding="utf-8") as f:
        texts = [line.strip() for line in f.readlines() if line.strip()]

    embeddings = model.encode(texts)

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    os.makedirs("faiss_index", exist_ok=True)

    faiss.write_index(index, "faiss_index/index.faiss")

    with open("faiss_index/texts.pkl", "wb") as f:
        pickle.dump(texts, f)

    print("✅ FAISS vector store created successfully")

if __name__ == "__main__":
    build_vector_store()
