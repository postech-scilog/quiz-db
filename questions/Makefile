# NOTE: 'questions' 디렉토리 안에서 `make` 해주세요

DEPS := $(shell find ./src -name '*' -print)

all: questions.db

questions.db: $(DEPS) lint
	@./scripts/make_db.py

lint:
	@./scripts/lint.py
	
.PHONY: all lint