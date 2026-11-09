# Production image: docker build -t ceda-portal . && docker run -p 3000:3000 --env-file .env ceda-portal
FROM node:20-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN yarn install --frozen-lockfile

FROM deps AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

FROM node:20-slim AS run
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl curl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build /app ./
RUN useradd --system --uid 1001 app && chown -R app /app/.next
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD curl -fsS http://localhost:3000/api/health || exit 1
# Syncs the schema on start, then serves the app.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx next start -p ${PORT}"]
