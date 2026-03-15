# Guide to local setap for LLama and fastapi

## Install dependencies

1. python 
```
brew install python
```
2. FastAPI and dependencies
```
pip install fastapi uvicorn requests
```
3. Ollama
```
brew install ollama
```

## Run Ollama service

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


## Run minimal FastAPI server for LLM

Script <b>main.py</b> is a minimal FastAPI server for LLM. It uses helper function defined in <b>json_stream_parser.py</b> in order to process LLM response (JSON stream) and creates a readable text.

Run the server from llm-service folder:
```
uvicorn main:app --reload --port 8000
```

and than in a new terminal test it with a curl. Example:

```
curl -X POST "http://127.0.0.1:8000/chat" -H "Content-Type: application/json" -d '{"prompt":"Objasni Beta funkciju"}'
```

