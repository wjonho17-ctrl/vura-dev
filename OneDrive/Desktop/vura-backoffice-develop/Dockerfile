FROM node:22.16.0-alpine3.22 AS base

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci --omit=dev

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
COPY --from=build /app/ecosystem.config.json /app/ecosystem.config.json

#adding tmp file for mainatenace package
RUN mkdir -p tmp 

#pm2
RUN npm install pm2 -g

# CMD ["pm2-runtime", "process.yml"]
CMD ["pm2-runtime", "ecosystem.config.json"]
