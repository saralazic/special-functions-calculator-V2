from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings
from concurrent.futures import ThreadPoolExecutor
import os

embedding_model = SentenceTransformerEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))

PDF_DB_PATH = os.path.join(ROOT_DIR, "knowledge_base/faiss_index")
LATEX_DB_PATH = os.path.join(ROOT_DIR, "knowledge_base/faiss_index_latex")

pdf_db = FAISS.load_local(PDF_DB_PATH, embedding_model, allow_dangerous_deserialization=True)
latex_db = FAISS.load_local(LATEX_DB_PATH, embedding_model, allow_dangerous_deserialization=True)


def get_context(query, k_each=2):
    with ThreadPoolExecutor(max_workers=2) as executor:
        pdf_future = executor.submit(pdf_db.similarity_search, query, k=k_each)
        latex_future = executor.submit(latex_db.similarity_search, query, k=k_each)

        pdf_results = pdf_future.result()
        latex_results = latex_future.result()

    chunks = [d.page_content for d in pdf_results + latex_results]

    return "\n\n---\n\n".join(chunks)