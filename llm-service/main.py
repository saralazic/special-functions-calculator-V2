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

MODEL_MAP = {
    "llama": "llama3",
    "qwen": "qwen2.5:7b"
}

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"


class PromptRequest(BaseModel):
    prompt: str
    model: str = "llama"


@app.post("/chat")
def chat(request: PromptRequest):
    try:
        print("\n===== NEW REQUEST =====")
        print("User prompt:", request.prompt)

        context = get_context(request.prompt, k_each=2)
        print("Context length:", len(context))

        # Raw f-string (rf""") allows LaTeX backslashes without Python errors
        rag_prompt = rf"""
You are a mathematics expert and scientific assistant.

Answer the user's question clearly and naturally, as if explaining to a student.
Generate answer in a language user asked question in (either Serbian or English)

DO NOT say phrases like:
- "according to the provided context"
- "the document states"
- "based on the text"

Give a direct explanation.

If the answer contains mathematical notation, you MUST format it using LaTeX.


Incorrect: df(x)/dx + (v/x)*f(x)
Correct: \[
\frac{{df(x)}}{{dx}} + \frac{{\nu}}{{x}} f(x)
\]

Incorrect: Jv(x)
Correct: J_{{\nu}}(x)

If context is insufficient, say you are not sure.

Be concise but informative.

Context:
{context}

Question:
{request.prompt}

Answer:
"""
        print("Prompt length:", len(rag_prompt))
        print("Prompt preview:", rag_prompt[:500])

        model_name = MODEL_MAP.get(request.model, "llama3:8b")

        payload = {
            "model": model_name,
            "prompt": rag_prompt,
            "stream": False,
            "options": {
                "num_predict": 1024,
                "temperature": 0.2,
            }
        }

        print("\nSending request to Ollama...")
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)

        print("Ollama status code:", response.status_code)
        print("Ollama raw response preview:", response.text[:1000])

        response.raise_for_status()

        json_resp = response.json()
        combined_text = json_resp.get("response", "")
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