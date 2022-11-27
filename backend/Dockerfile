FROM node:18-alpine

WORKDIR /bad

COPY package.json package-lock.json tsconfig.json ./

RUN npm i

COPY src/ ./src

RUN ls ./src

RUN npm run build

EXPOSE 3001

CMD [ "node", "./dist/index.js" ]
