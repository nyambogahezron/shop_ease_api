FROM node:14

WORKDIR ./

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Define the command to run your application
CMD ["node", "index.js"]