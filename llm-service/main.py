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
    language: str = "en"


@app.post("/chat")
def chat(request: PromptRequest):
    try:
        print("\n===== NEW REQUEST =====")
        print("User prompt:", request.prompt)

        model_name = MODEL_MAP.get(request.model, "llama3:8b")

        context = get_context(request.prompt, model_name, k_each=2)
        print("Context length:", len(context))

        lang_name = "Serbian" if request.language == "sr" else "English"

        # Raw f-string (rf""") allows LaTeX backslashes without Python errors
        rag_prompt = rf"""
You are a mathematics expert and scientific assistant specialized in special functions.

CRITICAL RULES:
1. NEVER mention "context", "provided text", "document", "source material", or anything similar. The user must not know you are reading any reference material. Speak as if this is your own knowledge.
2. NEVER fabricate, guess, or hallucinate information. If you are not confident in the answer, do NOT make something up. Accuracy is more important than completeness.
3. If you do not know the answer, simply apologize and say you currently do not have the knowledge to answer this question. Do NOT invent facts or formulas.

Answer the user's question clearly and naturally, as if explaining to a student.
You MUST reply ENTIRELY in {lang_name}. Every word of your answer must be in {lang_name}, regardless of the language of the question or the context.

DO NOT say phrases like:
- "according to the provided context"
- "the document states"
- "based on the text"
- "from the given context"
- "the context does not contain"
- "I cannot find this in the context"
- "the provided information"

Instead, if you cannot answer, say something like:
- (English) "I apologize, but I currently don't have sufficient knowledge to answer this question accurately."
- (Serbian) "Izvinjavam se, trenutno nemam dovoljno znanja da odgovorim na ovo pitanje."

Give a direct explanation.

If the answer contains mathematical notation, you MUST format it using LaTeX.

Incorrect: df(x)/dx + (v/x)*f(x)
Correct: \[
\frac{{df(x)}}{{dx}} + \frac{{\nu}}{{x}} f(x)
\]

Incorrect: Jv(x)
Correct: J_{{\nu}}(x)

Be concise but informative. Only state what you are confident is correct.

Context:
{context}

Question:
{request.prompt}

Answer:
"""
        print("Prompt length:", len(rag_prompt))
        print("Prompt preview:", rag_prompt[:500])

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