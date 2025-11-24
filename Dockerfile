FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

# Copy only Prisma schema for early generation
COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]

