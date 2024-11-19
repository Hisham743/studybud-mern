FROM node:20
WORKDIR /studybud/frontend

COPY package*.json ./
RUN npm install
RUN npm install -g http-server

COPY . .
RUN npm run build

WORKDIR /studybud/frontend/dist
ENV PORT=8080
CMD http-server . -p $PORT