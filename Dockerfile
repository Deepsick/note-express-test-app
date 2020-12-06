FROM node:12.18.1
ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

EXPOSE 3064
COPY . .
CMD [ "npm", "start" ]
