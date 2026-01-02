# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Install build tools untuk native modules seperti bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production (Image Kecil untuk STB)
FROM node:18-alpine
WORKDIR /app

# Install build tools untuk native modules seperti bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist

# Buat folder data agar tidak error saat mounting volume
RUN mkdir data

EXPOSE 3000
CMD ["node", "dist/app.js"]