.PHONY: install install-frontend install-backend llm-install llm-install-macos llm-run llm-build-kb build build-frontend build-backend dev dev-frontend dev-backend start clean

# ─── Install ────────────────────────────────────────────────
install: install-backend install-frontend

install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && npm install

# ─── LLM service ─────────────────────────────────────────────
llm-install:
	python3 -m pip install -r llm-service/requirements.txt

llm-install-macos:
	brew bundle --file=llm-service/Brewfile

llm-run:
	cd llm-service && uvicorn main:app --reload --port 8000

llm-build-kb:
	python3 llm-service/rag/build_pdf_knowledge_base.py
	python3 llm-service/rag/build_latex_knowledge_base.py

# ─── Build ──────────────────────────────────────────────────
build: build-backend build-frontend

build-frontend:
	cd frontend && npx ng build --configuration production

build-backend:
	cd backend && npm run build

# ─── Development (run both in parallel) ─────────────────────
dev:
	@echo "Starting backend on :3000 and frontend on :4200 ..."
	@trap 'kill 0' INT TERM; \
	(cd backend && npm run dev) & \
	(cd frontend && npx ng serve --proxy-config proxy.conf.json --open) & \
	wait

dev-frontend:
	cd frontend && npx ng serve --proxy-config proxy.conf.json --open

dev-backend:
	cd backend && npm run dev

# ─── Production ─────────────────────────────────────────────
start: build
	cd backend && npm start

# ─── Clean ──────────────────────────────────────────────────
clean:
	rm -rf frontend/node_modules frontend/dist
	rm -rf backend/node_modules backend/dist
