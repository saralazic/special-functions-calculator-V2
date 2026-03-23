# Guide to local setap for LLama and fastapi

## Install dependencies

This service tracks dependencies in files:
- Python packages: `requirements.txt`
- macOS/Homebrew packages: `Brewfile`

From project root:
```
make llm-install-macos
make llm-install
```
`llm-install-macos` installs `ollama`, `pkg-config`, and `libheif` (needed for `pi-heif` builds on macOS).
`llm-install` creates `llm-service/.venv` and installs Python dependencies there.

## Run Ollama

Run
```
ollama serve
```
and if you see the message like
```
Listening on 127.0.0.1:11434
```
do not close this terminal, Ollama works!

## Download and prepare Ollama open-source model

This step will: download open-source model, install it locally and prepare everything to chat.

Open new terminal (without closing previous one!) and run next command.

```
ollama pull llama3
```
Be aware that this step will take a while, 15+ minutes most likely.

## Test if model works

Run command
```
ollama run llama3
```
and that should start interactive chat prompt.

Ask him something, if you get response everything works. 
Close chat with next command.
```
/exit
```

## Install dependencies for RAG

RAG dependencies are already included in `requirements.txt` (PDF loading uses `pypdf` via `PyPDFLoader`).

## Build knowledge bases:

This two python scripts are intended to process pdf and latex files from literature and fill in vector_db which will be knowledge base for calculator.
```
make llm-build-kb
```

## Run minimal FastAPI server for LLM

Script <b>main.py</b> is a minimal FastAPI server for LLM. It uses helper function defined in <b>json_stream_parser.py</b> in order to process LLM response (JSON stream) and creates a readable text (which is later processed additionaly in the frontend component into a nicer format). It also uses helper for forming context out of knowledge base(s).

Run the server from project root:
```
make llm-run
```

and than in a new terminal test it with a curl. Example:

```
curl -X POST "http://127.0.0.1:8000/chat" -H "Content-Type: application/json" -d '{"prompt":"Objasni Beta funkciju"}'
```
