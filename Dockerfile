# Use Node.js 18 Alpine base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install required dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source files
COPY prisma ./prisma
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Start the application
CMD ["node", "dist/main.js"]
