FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 로컬에서 빌드 완료된 standalone 결과물 복사 (node:18-alpine에 내장된 비-root 계정 node로 소유권 지정)
COPY --chown=node:node .next/standalone ./
COPY --chown=node:node public ./public
COPY --chown=node:node .next/static ./.next/static

USER node

EXPOSE 3000
CMD ["node", "server.js"]
