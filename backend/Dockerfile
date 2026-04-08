FROM node:18-alpine

# Use environment variable for setting working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies based on package-lock if present, else package.json
RUN npm install --production

# Copy app source code, excluding patterns from .dockerignore
COPY . .

# Expose the API port
EXPOSE 5001

# Start up command
CMD ["npm", "start"]
