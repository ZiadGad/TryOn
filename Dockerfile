FROM node:20 AS development
WORKDIR /app
COPY package.json .

RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

FROM node:20 AS production
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev;
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

