# Use node-alpine as a base (30x smaller size being the major selling point)
FROM node:11.14.0-alpine

# Install dependencies for alpine (python, make and g++) via apk
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++

# Create the folder for the app and 
RUN mkdir -p /usr/src/app

# Set it as the workplace (commands will be ran from here)
WORKDIR /usr/src/app

# Copy host folder to container
COPY . .

# Install node modules
# Install dependencies for alpine (python, make and g++) via apk
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp

# Start the node server
CMD ["npm", "run", "start"]