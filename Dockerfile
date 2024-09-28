# Use an official Node.js image.
FROM node:20

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code to the working directory.
COPY . .

# Build the TypeScript code.
RUN npm run build

# Expose the application port.
EXPOSE 3000

# Start the application.
CMD ["npm", "run", "start"]
