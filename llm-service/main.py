from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from json_stream_parser import parse_stream_json
from fastapi.middleware.cors import CORSMiddleware
from rag.get_context import get_context
import traceback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: switch to localhost:4200
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"


class PromptRequest(BaseModel):
    prompt: str


@app.post("/chat")
def chat(request: PromptRequest):
    try:
        print("\n===== NEW REQUEST =====")
        print("User prompt:", request.prompt)

        # 🔹 RAG context
        context = get_context(request.prompt, k_each=2)
        print("Context length:", len(context))

        # 🔹 Build RAG prompt
        rag_prompt = f"""
You are a mathematical assistant.

Use the following context to answer the question.
If the context is insufficient, say so.

Context:
{context}

Question:
{request.prompt}

Answer:
"""
        print("Prompt length:", len(rag_prompt))
        print("Prompt preview:", rag_prompt[:500])

        # 🔹 Ollama payload
        payload = {
            "model": "llama3",
            "prompt": rag_prompt,
            "max_tokens": 400,
        }

        print("\nSending request to Ollama...")
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)

        print("Ollama status code:", response.status_code)
        print("Ollama raw response preview:", response.text[:1000])

        response.raise_for_status()

        combined_text = parse_stream_json(response.text)
        print("Parsed response preview:", combined_text[:500])

        print("===== REQUEST SUCCESS =====\n")

        return {"response": combined_text}

    except requests.exceptions.Timeout:
        print("ERROR: Ollama request timed out")
        raise HTTPException(status_code=504, detail="Ollama timeout")

    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to Ollama server")
        raise HTTPException(status_code=502, detail="Cannot connect to Ollama")

    except Exception as e:
        print("ERROR:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=502, detail=str(e))