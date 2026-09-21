FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package info and install
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port (default is 3001 in our app)
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
