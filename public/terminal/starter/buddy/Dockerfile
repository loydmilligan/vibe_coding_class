FROM node:22-alpine
WORKDIR /app
COPY server.js prompt.md ./
COPY public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
