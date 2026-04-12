# NOTE: 'questions' 디렉토리 안에서 `make` 해주세요

DEPS := $(shell find ./src -name '*' -print)

all: lint questions.db

questions.db: $(DEPS)
	@./scripts/make_db.py

lint:
	@./scripts/lint.py

clean:
	rm -rf questions.db
	
.PHONY: all lint clean