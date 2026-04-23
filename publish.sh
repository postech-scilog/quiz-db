#!/bin/sh
docker tag ghcr.io/postech-scilog/quiz-db:latest ghcr.io/postech-scilog/quiz-db:$1
docker push ghcr.io/postech-scilog/quiz-db:latest
docker push ghcr.io/postech-scilog/quiz-db:$1