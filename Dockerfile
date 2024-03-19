FROM node:20-alpine3.16

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY .env .
COPY ./src ./src

RUN apk add python3
RUN apk add --no-cache ffmpeg
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js", "--envi=production"]