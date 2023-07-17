FROM node:16.20.1

# Create app directory
WORKDIR /usr/src/savepointlodge.com

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Build
RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "run", "server"]