# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the code
COPY . .

# Expose the app port
EXPOSE 3001

# Run the app
CMD ["npm", "run" , "dev"]
