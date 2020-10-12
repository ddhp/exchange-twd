# FROM node:12
FROM buildkite/puppeteer

# Create app directory
WORKDIR /usr/src/app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install -g yarn
RUN yarn install --prod --frozen-lockfile

# Bundle app source
COPY index.js .
CMD [ "node", "index.js" ]
