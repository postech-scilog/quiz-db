# NOTE: 'questions' 디렉토리 안에서 `make` 해주세요

all: lint questions.db

questions.db:
	@./scripts/make_db.py

lint:
	@./scripts/lint.py

clean:
	rm -rf questions.db
	
.PHONY: all lint clean