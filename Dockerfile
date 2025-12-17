# Official Node.js 18 Alpine (lightweight & secure)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (clean & fast)
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY index.js .

# Expose port (Render.com auto-detect করে, কিন্তু ভালো practice)
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the app
CMD ["node", "index.js"]