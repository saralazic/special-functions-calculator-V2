from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import json
from json_stream_parser import parse_stream_json
from fastapi.middleware.cors import CORSMiddleware

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
    payload = {
        "model": "llama3",
        "prompt": request.prompt,
        "max_tokens": 200,
    }
    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()

        combined_text = parse_stream_json(response.text)

        return {"response": combined_text}

    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))