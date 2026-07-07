FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 로컬에서 빌드 완료된 standalone 결과물 복사
COPY .next/standalone ./
COPY public ./public
COPY .next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
