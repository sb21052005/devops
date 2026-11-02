FROM node:24-alpine AS verify
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts
COPY test ./test
RUN node scripts/lint.mjs && node --test && node scripts/package.mjs

FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=3000
ARG APP_VERSION=1.0.0
ENV APP_VERSION=${APP_VERSION}
WORKDIR /app
COPY --from=verify --chown=node:node /app/dist/shopeasy-lite/ ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.mjs"]
