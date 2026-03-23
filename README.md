# SpefCalculator

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.4.

## Install dependencies
```
yarn build
```

## Development server

To build whole project run:

```
make build
```

To start application run:
```
make dev
```
Navigate to `http://localhost:4200/`. 

## LLM service setup (chat support)

JavaScript dependencies are tracked in `package.json`.  
Python and system dependencies for the LLM service are tracked in:
- `llm-service/requirements.txt`
- `llm-service/Brewfile` (macOS/Homebrew)

Install everything for LLM service:
```
make llm-install-macos
make llm-install
```

Then run Ollama in one terminal:
```
ollama serve
```

Run FastAPI server in a second terminal:
```
make llm-run
```