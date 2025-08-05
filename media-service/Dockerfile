FROM node:18-alpine
# Set the working directory
WORKDIR /use/src/app    
# Copy package.json and package-lock.json
COPY package*.json ./   
# Install dependencies
RUN npm ci --only=production    
# Copy the rest of the application code
COPY . .
# Expose the port the app runs on
EXPOSE 3002

# Start the application
CMD ["npm", "start"]