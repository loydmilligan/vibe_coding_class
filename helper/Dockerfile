FROM node:22-alpine
WORKDIR /app
COPY server.mjs ./
RUN mkdir -p /data && chown node:node /data
USER node
ENV PORT=8787 HELP_BOT_DATA_DIR=/data
EXPOSE 8787
CMD ["node", "server.mjs"]
