ARG NODE_VERSION=25.9.0-alpine3.22
ARG PYTHON_VERSION=3.14.4-alpine3.23

# ===============================
# 프론트엔드 빌드 stage
# ===============================
FROM node:${NODE_VERSION} AS frontend-build

WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci && \
    npm cache clean --force
COPY frontend/ ./
RUN npm run build

# ===============================
# 아카이브 빌드 stage
# ===============================
FROM python:${PYTHON_VERSION} AS archive-build

WORKDIR /build/questions

COPY --from=ghcr.io/astral-sh/uv:0.11.6 /uv /uvx /bin/
RUN apk add --no-cache make sqlite coreutils
COPY questions/ ./
RUN make all

# ===============================
# 백엔드 의존성 설치 stage
# ===============================
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

# 보안을 위해 루트가 아닌 일반 유저 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

COPY backend/package*.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --omit=dev && \
    npm cache clean --force
RUN chown -R nodejs:nodejs /app

# ===============================
# 최종 이미지 생성 stage
# ===============================
FROM deps AS production

WORKDIR /app

COPY backend/ ./

# public, questions.db 심볼릭 링크를 빌드된 파일로 교체
RUN rm -f public questions.db
COPY --from=frontend-build /build/frontend/dist ./public
COPY --from=archive-build /build/questions/questions.db ./questions.db

# 설치된 의존성 복사
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nodejs:nodejs /app/package*.json ./

USER nodejs
EXPOSE 3000
CMD ["npm", "start"]

