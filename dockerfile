FROM node:14
WORKDIR ./urs/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/app/dist ./dist
COPY .env ./
EXPOSE 5000

# Define the command to run your application
CMD ["node", "index.js"]