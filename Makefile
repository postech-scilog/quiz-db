build:
	docker build --target production --tag ghcr.io/postech-scilog/quiz-db .

run:
	docker run --rm -p 3000:3000 ghcr.io/postech-scilog/quiz-db:latest

.PHONY: build