.PHONY: help install test lint format run-api run-frontend db-up db-down migrate

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install backend dependencies
	pip install -r requirements.txt

install-frontend: ## Install frontend dependencies
	npm ci

test: ## Run backend tests
	python -m pytest --tb=short -q

test-frontend: ## Run frontend tests
	npm run test

lint: ## Run backend linter
	black --check app tests

format: ## Format backend code
	black app tests

lint-frontend: ## Run frontend linter
	npm run lint

run-api: ## Run backend dev server
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend: ## Run frontend dev server
	npm run dev

db-up: ## Start Postgres via docker-compose
	docker compose up db -d

db-down: ## Stop Postgres via docker-compose
	docker compose down

migrate: ## Run Alembic migrations
	cd apps/api && python -m alembic upgrade head

migrate-create: ## Create new Alembic migration
	cd apps/api && python -m alembic revision --autogenerate -m "$(msg)"

build: ## Build frontend for production
	npm run build
