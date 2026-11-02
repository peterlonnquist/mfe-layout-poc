# Node-tjänst som serverar /bff/api/1.0/*. Ingen build behövs, inga beroenden.
#   docker build -f deploy/backend-for-frontend/Dockerfile -t mfe-layout-poc/backend-for-frontend .
FROM node:22-alpine
WORKDIR /app
ENV PORT=80
COPY apps/backend-for-frontend/server.mjs apps/backend-for-frontend/meny.json ./
EXPOSE 80
USER node
CMD ["node", "server.mjs"]
