FROM node:20-alpine3.17
WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY src src
COPY .cert .cert
CMD ["npm", "run", "start"]
