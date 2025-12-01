
FROM node:20.19-alpine AS builder
WORKDIR /app
COPY package*.json ./

# Install all dependencies (including devDependencies like TypeScript)
RUN npm install
COPY . .
# Compile the code to the /dist folder
RUN npm run build

FROM node:20.19-alpine AS runner
WORKDIR /app

# Copy package.json so we can install production dependencies
COPY package*.json ./


RUN npm ci --only=production

# Copy the compiled JavaScript code from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3001


CMD ["node", "dist/index.js"]