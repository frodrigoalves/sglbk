FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* /app/
RUN npm i --quiet || true
COPY src /app/src
COPY src/abi /app/src/abi
CMD ["npm","start"]
