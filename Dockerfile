FROM node:18-alpine

# Set work dir
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app
COPY . .

# Create logs dir (for mounted volume)
RUN mkdir -p /app/logs

# Expose port
ENV PORT=4000
EXPOSE 4000

# Start app
CMD ["npm", "start"]

