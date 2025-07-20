FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

COPY entrypoint.sh ./
ENTRYPOINT ["./entrypoint.sh"]