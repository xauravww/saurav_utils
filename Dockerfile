# Use an official Node runtime as a parent image.
FROM node:14-buster

# Install system dependencies required by textract.
RUN apt-get update && apt-get install -y \
    poppler-utils \
    antiword \
    && rm -rf /var/lib/apt/lists/*

# Create app directory and ensure uploads folder exists.
WORKDIR /app
RUN mkdir -p uploads

# Copy package files and install dependencies.
COPY package*.json ./
RUN npm install

# Bundle your app source.
COPY . .

# Expose the port the app runs on.
EXPOSE 3005

# Start the app.
CMD ["node", "index.js"]
