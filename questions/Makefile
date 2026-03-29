# NOTE: 'questions' 디렉토리 안에서 `make` 해주세요

DEPS := $(shell find ./src -name '*' -print)

all: questions.db

questions.db: $(DEPS)
	@./scripts/make_db.py
	
.PHONY: all