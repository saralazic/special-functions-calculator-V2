from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings
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
    pdf_results = pdf_db.similarity_search(query, k=k_each)
    latex_results = latex_db.similarity_search(query, k=k_each)

    chunks = []

    for d in pdf_results:
        chunks.append(d.page_content)

    for d in latex_results:
        chunks.append(d.page_content)

    return "\n\n---\n\n".join(chunks)