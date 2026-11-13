from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings
from concurrent.futures import ThreadPoolExecutor
import os
import requests

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

embedding_model = SentenceTransformerEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

PDF_DB_PATH = os.path.join(ROOT_DIR, "knowledge_base/faiss_index")
LATEX_DB_PATH = os.path.join(ROOT_DIR, "knowledge_base/faiss_index_latex")

pdf_db = FAISS.load_local(PDF_DB_PATH, embedding_model, allow_dangerous_deserialization=True)
latex_db = FAISS.load_local(LATEX_DB_PATH, embedding_model, allow_dangerous_deserialization=True)


def translate_to_english(query, model):
    """Translate query to English via the local Ollama instance.
    If the query is already in English, the model returns it as-is."""
    prompt = (
        "Translate the following text to English. "
        "If it is already in English, return it unchanged. "
        "Output ONLY the translated text, nothing else.\n\n"
        f"{query}"
    )
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 256},
            },
            timeout=30,
        )
        resp.raise_for_status()
        translated = resp.json().get("response", "").strip()
        if translated:
            return translated
    except Exception as e:
        print(f"Translation failed, falling back to original query: {e}")
    return query


def get_context(query, model, k_each=2):
    english_query = translate_to_english(query, model)
    print(f"RAG search query: {english_query}")

    with ThreadPoolExecutor(max_workers=2) as executor:
        pdf_future = executor.submit(pdf_db.similarity_search, english_query, k=k_each)
        latex_future = executor.submit(latex_db.similarity_search, english_query, k=k_each)

        pdf_results = pdf_future.result()
        latex_results = latex_future.result()

    chunks = [d.page_content for d in pdf_results + latex_results]

    return "\n\n---\n\n".join(chunks)