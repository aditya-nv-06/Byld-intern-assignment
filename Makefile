COMPOSE ?= docker compose
SERVICE ?= backend

.PHONY: up build down logs ps restart

up:
	$(COMPOSE) build $(SERVICE)
	$(COMPOSE) up -d

build:
	$(COMPOSE) build $(SERVICE)

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f $(SERVICE)

ps:
	$(COMPOSE) ps

restart:
	$(COMPOSE) down
	$(COMPOSE) build $(SERVICE)
	$(COMPOSE) up -d