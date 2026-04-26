import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.document_loaders import PyPDFLoader

PDF_PATHS = [
    "llm-service/rag/literature/An atlas of functions-192-232.pdf",
    "llm-service/rag/literature/An atlas of functions-431-444.pdf",
    "llm-service/rag/literature/An atlas of functions-504-518.pdf",
    "llm-service/rag/literature/Sara Lazic - master rad .pdf",
]

DB_PATH = "knowledge_base/faiss_index"


embedding_model = SentenceTransformerEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def load_pdf(file_path):
    loader = PyPDFLoader(file_path)
    return loader.load()

all_documents = []

# load pdf literature
for pdf_path in PDF_PATHS:
    documents = load_pdf(pdf_path)
    all_documents.extend(documents)

print(f"Overall number of documents: {len(all_documents)}")

# text splitting into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100
)
docs_split = text_splitter.split_documents(all_documents)

print(f"Overall number of chunks: {len(docs_split)}")

# create FAISS db
db = FAISS.from_documents(docs_split, embedding_model)

# save db to disk
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
db.save_local(DB_PATH)

print(f"Knowledge base saved at: {DB_PATH}")

print(f"Lengths of pdfs:")
for doc in all_documents:
    print(len(doc.page_content))