import os
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings


TEX_PATHS = [
    "llm-service/rag/literature/spef.tex",
]

# latex knowledge base
DB_PATH = "knowledge_base/faiss_index_latex"


embedding_model = SentenceTransformerEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def load_tex(file_path):
    """Loads latex file as text"""
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    return [Document(page_content=text, metadata={"source": file_path})]

all_documents = []

for tex_path in TEX_PATHS:
    documents = load_tex(tex_path)
    all_documents.extend(documents)

print(f"Loaded LaTeX documents: {len(all_documents)}")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1400,
    chunk_overlap=200
)

docs_split = text_splitter.split_documents(all_documents)

print(f"Number of LaTeX chunks: {len(docs_split)}")

db = FAISS.from_documents(docs_split, embedding_model)

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
db.save_local(DB_PATH)

print(f"LaTeX knowledge base saved at: {DB_PATH}")