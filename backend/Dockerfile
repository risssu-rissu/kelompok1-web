FROM node:18-alpine

WORKDIR /app

# Copy package files dan install dependencies
COPY package*.json ./
RUN npm install

# Copy semua kode backend
COPY . .

EXPOSE 5001

CMD ["npm", "start"]
